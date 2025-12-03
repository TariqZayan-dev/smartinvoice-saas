import "./index.css";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const FREE_LIMIT = 5;
const round2 = (v) =>
  Math.round((Number(v || 0) + Number.EPSILON) * 100) / 100;

/* ---------------- INVOICE EXPORT ---------------- */

function InvoiceExport({
  currency,
  from,
  to,
  invoiceNumber,
  invoiceDate,
  items,
  subtotal,
  taxAmount,
  discountAmount,
  total,
  isTaxEnabled,
  effectiveTaxRate,
}) {
  return (
    <div className="export-page invoice-page">
      <header className="export-header-simple">
        <div className="export-header-top">
          <div>
            {from.logo && (
              <img
                src={from.logo}
                className="invoice-logo"
                alt={from.businessName || "Logo"}
              />
            )}
          </div>
          <div className="export-header-meta">
            <div className="export-meta-row">
              <span className="export-meta-label">INVOICE&nbsp;NO:</span>
              <span>{invoiceNumber || "—"}</span>
            </div>
            <div className="export-meta-row">
              <span className="export-meta-label">DATE:</span>
              <span>{invoiceDate || "—"}</span>
            </div>
          </div>
        </div>

        <h1 className="export-title-center">INVOICE</h1>

        {/* FROM (left) + BILL TO (right) */}
        <div className="invoice-meta-row">
          <div className="invoice-from-block">
            <div className="invoice-meta-label">FROM</div>
            <div>{from.businessName || "Your company"}</div>
            {from.phone && <div>Phone: {from.phone}</div>}
            {from.email && <div>Email: {from.email}</div>}
          </div>

          <div className="invoice-billto-block">
            <div className="invoice-meta-label">BILL TO</div>
            <div>{to.clientName || "Client name"}</div>
          </div>
        </div>
      </header>

      <table className="export-table">
        <thead>
          <tr>
            <th>DESCRIPTION</th>
            <th>UNIT PRICE ({currency})</th>
            <th>QTY</th>
            <th>TOTAL ({currency})</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="export-empty">
                No items
              </td>
            </tr>
          )}
          {items.map((item, i) => {
            if (!item.description && !item.quantity && !item.price) return null;
            const amount = round2((item.quantity || 0) * (item.price || 0));
            return (
              <tr key={i}>
                <td>{item.description || "—"}</td>
                <td className="export-num">
                  {round2(item.price || 0).toFixed(2)}
                </td>
                <td className="export-num">{item.quantity || 0}</td>
                <td className="export-num">{amount.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="export-totals-simple">
        <div className="export-totals-row">
          <span>Subtotal</span>
          <span>
            {subtotal.toFixed(2)} {currency}
          </span>
        </div>

        {isTaxEnabled && taxAmount > 0 && (
          <div className="export-totals-row">
            <span>Tax ({effectiveTaxRate.toFixed(2)}%)</span>
            <span>
              {taxAmount.toFixed(2)} {currency}
            </span>
          </div>
        )}

        {discountAmount > 0 && (
          <div className="export-totals-row">
            <span>Discount</span>
            <span>
              -{discountAmount.toFixed(2)} {currency}
            </span>
          </div>
        )}

        <div className="export-totals-row export-totals-total">
          <span>Total</span>
          <span>
            {total.toFixed(2)} {currency}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- QUOTATION EXPORT ---------------- */

function QuotationExport({
  currency,
  from,
  to,
  invoiceDate,
  items,
  subtotal,
  taxAmount,
  discountAmount,
  total,
  isTaxEnabled,
  effectiveTaxRate,
}) {
  return (
    <div className="export-page quote-page">
      <div className="quote-inner">
        {/* HEADER */}
        <div className="quote-header">
          <h2 className="quote-title">QUOTATION</h2>
          <p className="quote-subtitle">
            Date: {invoiceDate || new Date().toISOString().slice(0, 10)}
          </p>
        </div>

        {/* META BLOCKS */}
        <div className="quote-meta">
          <div className="quote-meta-block">
            {from.logo && (
              <img
                src={from.logo}
                className="quote-logo"
                alt={from.businessName || "Logo"}
              />
            )}
            <div className="quote-meta-label">FROM</div>
            <div>{from.businessName || "Your company"}</div>
            {from.phone && <div>Phone: {from.phone}</div>}
            {from.email && <div>Email: {from.email}</div>}
          </div>

          <div className="quote-meta-block quote-meta-right">
            <div className="quote-meta-label">TO</div>
            <div>{to.clientName || "Client name"}</div>
          </div>
        </div>

        {/* TABLE */}
        <div className="quote-table-section">
          <table className="quote-table">
            <thead>
              <tr>
                <th>Item description</th>
                <th>Quantity</th>
                <th>Unit price ({currency})</th>
                <th>Total price ({currency})</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="export-empty">
                    No items
                  </td>
                </tr>
              )}
              {items.map((item, i) => {
                if (!item.description && !item.quantity && !item.price)
                  return null;
                const line = round2(
                  (item.quantity || 0) * (item.price || 0)
                );
                return (
                  <tr key={i}>
                    <td>{item.description || "—"}</td>
                    <td>{item.quantity || 0}</td>
                    <td className="export-num">
                      {round2(item.price || 0).toFixed(2)}
                    </td>
                    <td className="export-num">{line.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* SUMMARY */}
        <div className="quote-summary">
          <div className="quote-summary-row">
            <span>Subtotal</span>
            <span>
              {subtotal.toFixed(2)} {currency}
            </span>
          </div>

          {isTaxEnabled && taxAmount > 0 && (
            <div className="quote-summary-row">
              <span>Tax ({effectiveTaxRate.toFixed(2)}%)</span>
              <span>
                {taxAmount.toFixed(2)} {currency}
              </span>
            </div>
          )}

          {discountAmount > 0 && (
            <div className="quote-summary-row">
              <span>Discount</span>
              <span>
                -{discountAmount.toFixed(2)} {currency}
              </span>
            </div>
          )}

          <div className="quote-summary-row quote-summary-total">
            <span>Total amount</span>
            <span>
              {total.toFixed(2)} {currency}
            </span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="quote-footer">
          <strong>Generated with SmartInvoice</strong>
        </div>
      </div>
    </div>
  );
}

/* ---------------- MAIN APP ---------------- */

function App() {
  /* document + amounts */
  const [docType, setDocType] = useState("invoice");
  const [currency, setCurrency] = useState("AED");

  const [invoiceNumber, setInvoiceNumber] = useState("INV-001");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [from, setFrom] = useState({
    businessName: "",
    email: "",
    phone: "",
    logo: "",
  });

  const [to, setTo] = useState({
    clientName: "",
  });

  const [items, setItems] = useState([
    { description: "", quantity: 1, price: 0 },
  ]);

  const [isTaxEnabled, setIsTaxEnabled] = useState(false);
  const [taxRate, setTaxRate] = useState(5);
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountValue, setDiscountValue] = useState(0);

  /* auth state + profile */
  const [user, setUser] = useState(null);
  const [profileName, setProfileName] = useState("");
  const [usedDocs, setUsedDocs] = useState(0);
  const [planType, setPlanType] = useState("free");
  const [subscriptionExpiry, setSubscriptionExpiry] = useState(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  /* preview modal */
  const [previewOpen, setPreviewOpen] = useState(false);

  /* NEW – subscription plan modal states */
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("yearly");

  // Ziina payment links
  const YEARLY_URL = "https://pay.ziina.com/smartinvoice/G3Dv1XEau";
  const LIFETIME_URL = "https://pay.ziina.com/smartinvoice/kvXLllIjer";

  // Call Supabase Edge Function to create a Ziina payment intent
  const handlePlanCheckout = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("ziina-verify", {
        body: {
          mode: "create-intent",
          planType: selectedPlan, // "yearly" or "lifetime"
        },
      });

      if (error) {
        console.error("Ziina create-intent error:", error);
        alert("Something went wrong starting the payment. Please try again.");
        return;
      }

      if (data && data.payment_url) {
        // send user to Ziina checkout
        window.location.href = data.payment_url;
      } else {
        console.error("Ziina create-intent: no payment_url in response:", data);
        alert("Could not open payment page. Please try again.");
      }
    } catch (err) {
      console.error("Ziina create-intent unexpected error:", err);
      alert("Unexpected error. Please try again.");
    }
  };

  /* upgrade modal INSIDE preview */
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  /* ---------- derived totals ---------- */

  const subtotal = items.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.price || 0),
    0
  );

  const effectiveTaxRate = isTaxEnabled ? taxRate || 0 : 0;
  const taxAmount = isTaxEnabled
    ? round2((subtotal * effectiveTaxRate) / 100)
    : 0;

  const preDiscountTotal = subtotal + taxAmount;
  const rawDiscount = showDiscount ? discountValue || 0 : 0;
  const cappedDiscount = Math.min(Math.max(rawDiscount, 0), preDiscountTotal);
  const discountAmount = showDiscount ? round2(cappedDiscount) : 0;
  const total = Math.max(0, round2(preDiscountTotal - discountAmount));

  /* ---------- SUPABASE AUTH ---------- */

  useEffect(() => {
    let ignore = false;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (!ignore) setUser(data?.user ?? null);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, []);

  // Load profile name + free_docs_used
  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setProfileName("");
        setUsedDocs(0);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, free_docs_used, plan_type, subscription_expiry")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setProfileName(data.full_name || "");
        setUsedDocs(data.free_docs_used ?? 0);

        // NEW:
        setPlanType(data.plan_type || "free");
        setSubscriptionExpiry(
          data.subscription_expiry ? new Date(data.subscription_expiry) : null
        );
      }
    }

    loadProfile();
  }, [user]);

  const openAuthModal = (mode = "login") => {
    setAuthMode(mode);
    setAuthError("");
    setAuthLoading(false);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setAuthError("");
    setAuthLoading(false);
  };

  async function handleLogin(e) {
    e?.preventDefault();
    setAuthError("");

    if (!authEmail || !authPassword) {
      setAuthError("Please enter email and password.");
      return;
    }

    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });
    setAuthLoading(false);

    if (error) {
      setAuthError(error.message);
      return;
    }

    closeAuthModal();
    setPreviewOpen(true);
  }

  async function handleSignup(e) {
    e?.preventDefault();
    setAuthError("");

    if (!authName || !authEmail || !authPassword) {
      setAuthError("Name, email and password are required.");
      return;
    }

    if (authPassword.length < 5) {
      setAuthError("Password must be at least 5 characters.");
      return;
    }

    setAuthLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: authEmail,
      password: authPassword,
      options: {
        data: {
          full_name: authName,
        },
      },
    });

    if (error) {
      setAuthLoading(false);
      setAuthError(error.message);
      return;
    }

    // create profile row (trial start now, free_docs_used = 0)
    if (data.user) {
      await supabase.from("profiles").insert({
        user_id: data.user.id,
        full_name: authName,
        trial_started_at: new Date().toISOString(),
        free_docs_used: 0,
      });
    }

    setAuthLoading(false);
    closeAuthModal();
    setPreviewOpen(true);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  async function testZiinaVerify() {
    try {
      const { data, error } = await supabase.functions.invoke("ziina-verify", {
        body: {},
      });

      console.log("ziina-verify response:", data, error);
      alert(
        error
          ? "Ziina test failed, check console."
          : `Ziina test OK: hasToken = ${data.hasToken}`
      );
    } catch (e) {
      console.error("Unexpected error calling ziina-verify:", e);
      alert("Unexpected error calling ziina-verify, check console.");
    }
  }

  /* ---------- FORM HANDLERS ---------- */

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: field === "description" ? value : Number(value) || 0,
      };
      return copy;
    });
  };

  const addItem = () =>
    setItems((prev) => [...prev, { description: "", quantity: 1, price: 0 }]);

  const removeItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const handleCurrencyChange = (val) => {
    setCurrency(val);
    if (val === "AED" && !isTaxEnabled) setTaxRate(5);
    if (val !== "AED" && !isTaxEnabled) setTaxRate(0);
  };

  const handleDocTypeChange = (type) => {
    if (type === docType) return;
    setDocType(type);
    setInvoiceNumber(type === "invoice" ? "INV-001" : "QUOTE-001");
  };

  const handleReset = () => {
    const today = new Date().toISOString().slice(0, 10);
    setFrom({ businessName: "", email: "", phone: "", logo: "" });
    setTo({ clientName: "" });
    setItems([{ description: "", quantity: 1, price: 0 }]);
    setIsTaxEnabled(false);
    setTaxRate(currency === "AED" ? 5 : 0);
    setShowDiscount(false);
    setDiscountValue(0);
    setInvoiceDate(today);
    setInvoiceNumber(docType === "invoice" ? "INV-001" : "QUOTE-001");
  };

  const openPreviewModal = () => {
    if (!user) {
      openAuthModal("login");
    } else {
      setPreviewOpen(true);
    }
  };

  const closePreviewModal = () => {
    setPreviewOpen(false);
    setUpgradeOpen(false);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFrom((prev) => ({
        ...prev,
        logo: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  async function handleDownloadPDF() {

    // 🚫 Block expired paid users
    if (planType !== "free") {
      if (subscriptionExpiry && new Date() > subscriptionExpiry) {
        setShowPlanModal(true);
        return;
      }
    }
    // Block ONLY free users if free limit reached
    if (planType === "free" && usedDocs >= FREE_LIMIT) {
      setUpgradeOpen(true);
      return;
    }

    const node = document.getElementById("export-root");
    if (!node) return;

    const canvas = await html2canvas(node, {
      scale: 2,
      useCORS: true,
      scrollX: 0,
      scrollY: 0,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const imgWidth = canvas.width * ratio;
    const imgHeight = canvas.height * ratio;
    const x = (pageWidth - imgWidth) / 2;
    const y = 20;

    pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
    pdf.save(docType === "invoice" ? "invoice.pdf" : "quotation.pdf");

    // increment usage count
    const nextUsed = usedDocs + 1;
    setUsedDocs(nextUsed);

    if (user) {
      await supabase
        .from("profiles")
        .update({ free_docs_used: nextUsed })
        .eq("user_id", user.id);
    }

  }

  /* ---------- FREE PLAN STATE ---------- */

  const remainingDocs = Math.max(FREE_LIMIT - usedDocs, 0);
  const progressPercent = Math.min((usedDocs / FREE_LIMIT) * 100, 100);

  let usageStatus = "ok";
  if (remainingDocs === 0) usageStatus = "limit";
  else if (remainingDocs <= 2) usageStatus = "warning";

  const usageLabel =
    remainingDocs > 0
      ? `Free plan: ${remainingDocs}/${FREE_LIMIT} documents remaining`
      : "Free plan: limit reached";

  /* ---------- RENDER ---------- */

  const docTitle = docType === "invoice" ? "Invoice info" : "Quotation info";
  const billToTitle = docType === "invoice" ? "Bill to (client)" : "Quote to";

  const displayName =
    profileName || user?.user_metadata?.full_name || user?.email;

  return (
    <div className="app">
      {/* HEADER */}
      <header className="app-header">
        <div>
          <h1>Smart Invoice</h1>
        </div>

        <div className="header-actions">
          {user ? (
            <>
              <span className="header-greeting">
                Hi {displayName || "there"}
              </span>
              <button className="secondary-btn" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <button
              className="primary-btn"
              onClick={() => openAuthModal("login")}
            >
              Log in / Create account
            </button>
          )}
        </div>
      </header>

      {/* TRIAL BAR */}
      {planType === "free" && (
        <div className="trial-bar">
          <span>
            Generate 5 INVOICES or QUOTATIONS for free. No card required.
          </span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <select
              className="currency-select"
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
            >
              <option value="AED">AED – United Arab Emirates Dirham</option>
              <option value="USD">USD – US Dollar</option>
              <option value="EUR">EUR – Euro</option>
              <option value="GBP">GBP – British Pound</option>
            </select>
          </div>
        </div>
      )}

      {/* DOC TYPE TOGGLE */}
      <div className="doc-type-toggle-wrapper">
        <div className="doc-type-toggle">
          <button
            type="button"
            className={
              "doc-type-button" + (docType === "invoice" ? " active" : "")
            }
            onClick={() => handleDocTypeChange("invoice")}
          >
            Invoice
          </button>
          <button
            type="button"
            className={
              "doc-type-button" + (docType === "quotation" ? " active" : "")
            }
            onClick={() => handleDocTypeChange("quotation")}
          >
            Quotation
          </button>
        </div>
      </div>

      {/* MAIN BUILDER */}
      <main className="invoice-container">
        {/* TOP CARDS */}
        <section className="invoice-row">
          <div className="card">
            <h2>From (your details)</h2>
            <div className="field-group">
              <label>Business / your name</label>
              <input
                type="text"
                value={from.businessName}
                onChange={(e) =>
                  setFrom((prev) => ({
                    ...prev,
                    businessName: e.target.value,
                  }))
                }
                placeholder="e.g. Tariq Dev Hub"
              />
            </div>
            <div className="field-group">
              <label>Email</label>
              <input
                type="email"
                value={from.email}
                onChange={(e) =>
                  setFrom((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="you@example.com"
              />
            </div>
            <div className="field-group">
              <label>Phone</label>
              <input
                type="text"
                value={from.phone}
                onChange={(e) =>
                  setFrom((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="+971..."
              />
            </div>
            <div className="field-group">
              <label>Add your logo (optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
              />
            </div>
          </div>

          <div className="card">
            <h2>{billToTitle}</h2>
            <div className="field-group">
              <label>Client / company name</label>
              <input
                type="text"
                value={to.clientName}
                onChange={(e) =>
                  setTo((prev) => ({ ...prev, clientName: e.target.value }))
                }
                placeholder="Client / company"
              />
            </div>
          </div>

          <div className="card">
            <h2>{docTitle}</h2>
            <div className="field-group">
              <label>
                {docType === "invoice" ? "Invoice number" : "Reference #"}
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>
            <div className="field-group">
              <label>Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* ITEMS */}
        <section className="card">
          <h2>Items</h2>

          <div className="items-scroll">
            <div className="items-table">

              <div className="items-header">
                <span>Description</span>
                <span>Qty</span>
                <span>Price ({currency})</span>
                <span>Amount ({currency})</span>
                <span></span>
              </div>

              {items.map((item, i) => {
                const amount = round2((item.quantity || 0) * (item.price || 0));

                return (
                  <div className="items-row" key={i}>
                    <input
                      type="text"
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(i, "description", e.target.value)
                      }
                    />

                    <input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(i, "quantity", e.target.value)
                      }
                    />

                    <input
                      type="number"
                      min="0"
                      value={item.price}
                      onChange={(e) =>
                        handleItemChange(i, "price", e.target.value)
                      }
                    />

                    <span className="items-amount">
                      {amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>

                    <button
                      className="ghost-btn"
                      onClick={() => removeItem(i)}
                      disabled={items.length === 1}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <button className="secondary-btn" onClick={addItem}>
            + Add item
          </button>
        </section>

        {/* TOTALS + DOWNLOAD + USAGE BAR */}
        <section className="totals-row">
          <div className="totals-left">
            <div className="download-cta-wrapper">
              <button
                className="download-big-btn"
                type="button"
                onClick={openPreviewModal}
              >
                Download {docType === "invoice" ? "invoice" : "quotation"}
              </button>

              <button
                type="button"
                className="ghost-reset-btn"
                onClick={handleReset}
              >
                Reset document
              </button>
            </div>

            {user && planType === "free" && (
              <div className={`free-usage-banner status-${usageStatus}`}>
                <div className="free-usage-top">
                  <span>{usageLabel}</span>
                  <span className="free-usage-counter">
                    {usedDocs}/{FREE_LIMIT} used
                  </span>
                </div>
                <div className="free-usage-bar">
                  <div
                    className="free-usage-bar-fill"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {remainingDocs === 0 && (
                  <button
                    className="upgrade-btn"
                    type="button"
                    onClick={() => setShowPlanModal(true)}
                  >
                    Only 29 AED to continue
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="card totals-card">
            <div className="total-line">
              <span>Subtotal:</span>
              <span>
                {round2(subtotal).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                {currency}
              </span>
            </div>

            <div className="total-line">
              <span>
                <label>
                  <input
                    type="checkbox"
                    checked={isTaxEnabled}
                    onChange={(e) => setIsTaxEnabled(e.target.checked)}
                    style={{ marginRight: 6 }}
                  />
                  Apply tax
                </label>
              </span>
              <span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  disabled={!isTaxEnabled}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  style={{
                    width: "70px",
                    padding: "4px 6px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                    fontSize: "13px",
                  }}
                />{" "}
                %
              </span>
            </div>

            <div className="total-line">
              <span>
                Tax (
                {isTaxEnabled ? effectiveTaxRate.toFixed(2) : "0.00"}
                %):
              </span>
              <span>
                {taxAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                {currency}
              </span>
            </div>

            {!showDiscount ? (
              <div className="total-line">
                <button
                  className="ghost-btn"
                  onClick={() => setShowDiscount(true)}
                >
                  + Add discount
                </button>
              </div>
            ) : (
              <>
                <div className="total-line">
                  <span>Discount amount:</span>
                  <span>
                    <input
                      type="number"
                      min="0"
                      value={discountValue}
                      onChange={(e) =>
                        setDiscountValue(Number(e.target.value) || 0)
                      }
                      style={{
                        width: "90px",
                        padding: "4px 6px",
                        borderRadius: "6px",
                        border: "1px solid #d1d5db",
                        fontSize: "13px",
                      }}
                    />{" "}
                    {currency}
                  </span>
                </div>
                <div className="total-line">
                  <span>Discount:</span>
                  <span>
                    -
                    {discountAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    {currency}
                  </span>
                </div>
              </>
            )}

            <div className="total-line total-main">
              <span>Total:</span>
              <span>
                {total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                {currency}
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* AUTH MODAL */}
      {authModalOpen && (
        <div className="auth-modal-backdrop" onClick={closeAuthModal}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <h2>
              {authMode === "login"
                ? "Login to download"
                : "Create account to download"}
            </h2>

            {authMode === "signup" && (
              <div className="field-group">
                <label>Name</label>
                <input
                  type="text"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
            )}

            <div className="field-group">
              <label>Email</label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="field-group">
              <label>Password</label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {authError && (
              <p style={{ color: "#dc2626", fontSize: 12 }}>{authError}</p>
            )}

            <button
              className="primary-btn"
              disabled={authLoading}
              onClick={authMode === "login" ? handleLogin : handleSignup}
            >
              {authLoading
                ? "Please wait..."
                : authMode === "login"
                  ? "Continue (log in)"
                  : "Create account"}
            </button>

            <button
              className="secondary-btn"
              type="button"
              onClick={() =>
                setAuthMode((m) => (m === "login" ? "signup" : "login"))
              }
            >
              {authMode === "login"
                ? "New here? Create account"
                : "Already have account? Log in"}
            </button>

            <button className="ghost-btn" onClick={closeAuthModal}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* PLAN CHOICE MODAL */}
      {showPlanModal && (
        <div
          className="plan-modal-backdrop"
          onClick={() => setShowPlanModal(false)}
        >
          <div
            className="plan-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="plan-modal-title">Choose your plan</h2>
            <p className="plan-modal-subtitle">
              Unlock SmartInvoice and keep generating invoices & quotations.
            </p>

            <div className="plan-pills">
              {/* Yearly plan pill */}
              <button
                type="button"
                className={
                  "plan-pill" + (selectedPlan === "yearly" ? " active" : "")
                }
                onClick={() => setSelectedPlan("yearly")}
              >
                <div className="plan-pill-label">Yearly access</div>
                <div className="plan-pill-price">29 AED / year</div>
                <ul className="plan-pill-points">
                  <li>Unlimited Invoices & Quotes for a full year</li>
                  <li>Access to Professional templates</li>
                  <li>Renew next year only if you still love it</li>
                  <li>Flexible- No hidden auto-renew charges</li>

                </ul>
              </button>

              {/* Lifetime plan pill */}
              <button
                type="button"
                className={
                  "plan-pill" + (selectedPlan === "lifetime" ? " active" : "")
                }
                onClick={() => setSelectedPlan("lifetime")}
              >
                <div className="plan-pill-label">Lifetime access</div>
                <div className="plan-pill-price">99 AED / once</div>
                <ul className="plan-pill-points">
                  <li>One-Time Payment, Generate forever</li>
                  <li>No renewals, no future payments</li>
                  <li>Best for small businesses & freelancers</li>
                  <li>The most affordable way to validate your business idea</li>
                </ul>
              </button>
            </div>

            <div className="plan-modal-actions">
              <button
                type="button"
                className="plan-pay-btn"
                onClick={handlePlanCheckout}
              >
                {selectedPlan === "yearly" ? "Pay 29 AED" : "Pay 99 AED"}
              </button>

              <button
                type="button"
                className="plan-cancel-btn"
                onClick={() => setShowPlanModal(false)}
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewOpen && (
        <div className="preview-modal-backdrop" onClick={closePreviewModal}>
          <div
            className="preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="preview-toolbar">
              <span className="preview-toolbar-title">
                {docType === "invoice" ? "Invoice preview" : "Quotation preview"}
              </span>
              <div className="preview-toolbar-actions">
                <button
                  className="secondary-btn"
                  type="button"
                  onClick={handleDownloadPDF}
                >
                  Download PDF
                </button>
                <button
                  className="ghost-btn"
                  type="button"
                  onClick={closePreviewModal}
                >
                  Close
                </button>
              </div>
            </div>

            <div className="preview-content">
              <div id="export-root">
                {docType === "invoice" ? (
                  <InvoiceExport
                    currency={currency}
                    from={from}
                    to={to}
                    invoiceNumber={invoiceNumber}
                    invoiceDate={invoiceDate}
                    items={items}
                    subtotal={round2(subtotal)}
                    taxAmount={taxAmount}
                    discountAmount={discountAmount}
                    total={total}
                    isTaxEnabled={isTaxEnabled}
                    effectiveTaxRate={effectiveTaxRate}
                  />
                ) : (
                  <QuotationExport
                    currency={currency}
                    from={from}
                    to={to}
                    invoiceDate={invoiceDate}
                    items={items}
                    subtotal={round2(subtotal)}
                    taxAmount={taxAmount}
                    discountAmount={discountAmount}
                    total={total}
                    isTaxEnabled={isTaxEnabled}
                    effectiveTaxRate={effectiveTaxRate}
                  />
                )}
              </div>
            </div>

            {/* UPGRADE POPUP INSIDE PREVIEW */}
            {upgradeOpen && (
              <div
                className="upgrade-overlay"
                onClick={() => setUpgradeOpen(false)}
              >
                <div
                  className="upgrade-modal"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="upgrade-close"
                    onClick={() => setUpgradeOpen(false)}
                  >
                    Close
                  </button>
                  <h3>Limit reached!</h3>
                  <p>
                    Continue for a small fee.
                  </p>
                  <button
                    type="button"
                    className="upgrade-pay-btn"
                    onClick={() => {
                      setUpgradeOpen(false);     // close the old limit popup
                      setShowPlanModal(true);    // open the Yearly / Lifetime plan modal
                    }}
                  >
                    Pay 29 AED
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

