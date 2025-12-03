import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function PaymentSuccess() {
  // checking | success | failed | error
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    async function verifyAndUpgrade() {
      const url = new URL(window.location.href);

      // Ziina sends ?id=<payment_intent_id> (or sometimes payment_intent_id)
      const paymentIntentId =
        url.searchParams.get("id") ||
        url.searchParams.get("payment_intent_id");

      // We’ll try to read planType from URL (?planType=yearly/lifetime)
      const planTypeFromUrl =
        url.searchParams.get("planType") ||
        url.searchParams.get("plan") ||
        "yearly"; // fallback if missing

      if (!paymentIntentId) {
        setStatus("error");
        setMessage("Missing payment reference. Please contact support.");
        return;
      }

      // 1) Ask Edge Function to confirm payment with Ziina
      const { data, error } = await supabase.functions.invoke("ziina-verify", {
        body: {
          mode: "confirm-payment",
          paymentIntentId,
        },
      });

      if (error) {
        console.error("Ziina confirm-payment error:", error);
        setStatus("error");
        setMessage(
          "We couldn't confirm your payment. If you were charged, please contact support."
        );
        return;
      }

      if (!data?.ok || !data?.success) {
        console.error("Ziina confirm-payment response:", data);
        setStatus("failed");
        setMessage(
          "We couldn't confirm the payment yet. If you were charged, please contact support."
        );
        return;
      }

      // 2) Payment confirmed → upgrade plan in Supabase
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Could not get current user:", userError);
        setStatus("error");
        setMessage(
          "Payment confirmed, but we could not update your account automatically. Please contact support."
        );
        return;
      }

      // Calculate subscription_expiry
      let subscription_expiry = null;
      if (planTypeFromUrl === "yearly") {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 365);
        subscription_expiry = expiry.toISOString();
      } else if (planTypeFromUrl === "lifetime") {
        // You can pick your own convention; here we just leave expiry as null
        subscription_expiry = null;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          plan_type: planTypeFromUrl,
          subscription_expiry,
        })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Failed to update profile:", updateError);
        setStatus("error");
        setMessage(
          "Payment confirmed, but there was an issue updating your plan. Please contact support."
        );
        return;
      }

      // 3) All good 🎉
      setStatus("success");
      setMessage("✅ Payment confirmed! Your plan is now active.");
    }

    verifyAndUpgrade();
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", textAlign: "center" }}>
      <h1>Payment status</h1>
      <p>{message}</p>
    </div>
  );
}
