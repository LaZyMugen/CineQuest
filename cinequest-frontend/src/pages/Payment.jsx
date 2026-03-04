import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import PageWrapper from "../components/layout/PageWrapper";
import Button from "../components/ui/Button";
import { confirmBooking } from "../lib/api";

const paymentMethods = [
  { value: "upi", label: "UPI" },
  { value: "visa", label: "Visa Card" },
  { value: "mastercard", label: "Mastercard" },
  { value: "cash", label: "Cash" },
  { value: "netbanking", label: "Net Banking" },
];

export default function Payment() {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const booking = location.state?.booking ?? null;
  const showId = location.state?.showId ?? searchParams.get("showId") ?? booking?.show_id ?? null;
  const totalAmount = booking?.total_amount ?? booking?.total_cost ?? "-";

  const [method, setMethod] = useState("upi");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const bookingExpired = useMemo(() => {
    if (!booking?.expires_at || booking?.status !== "LOCKED") return false;
    const raw = String(booking.expires_at);
    const normalized = raw.includes("Z") || raw.includes("+") ? raw : `${raw}Z`;
    return new Date(normalized).getTime() < Date.now();
  }, [booking]);

  async function handleConfirmPayment() {
    setError("");

    if (!billingEmail.trim()) {
      setError("Billing email is required.");
      return;
    }

    if (!billingAddress.trim()) {
      setError("Billing address is required.");
      return;
    }

    if (bookingExpired) {
      setError("This booking lock has expired. Please book seats again.");
      return;
    }

    setProcessing(true);
    try {
      await confirmBooking(bookingId);

      navigate(`/show/${showId}/seats`, {
        replace: true,
        state: {
          confirmedBooking: {
            ...(booking || {}),
            booking_id: Number(bookingId),
            status: "CONFIRMED",
            expires_at: null,
          },
        },
      });
    } catch (err) {
      setError(err?.message || "Payment confirmation failed. Please try again.");
      setProcessing(false);
    }
  }

  return (
    <>
      <Navbar />
      <PageWrapper title="Payment" subtitle={`Booking #${bookingId}`}>
        <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[2fr,1fr]">
          <section className="rounded-lg border border-border bg-card p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-200">Select Payment Method</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {paymentMethods.map((option) => (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-md border px-4 py-3 text-sm transition-colors ${
                    method === option.value
                      ? "border-accent bg-accent/10 text-gray-100"
                      : "border-border text-muted hover:border-accent/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value={option.value}
                    checked={method === option.value}
                    onChange={(e) => setMethod(e.target.value)}
                    className="mr-2"
                  />
                  {option.label}
                </label>
              ))}
            </div>

            <div className="space-y-2 text-sm">
              <label htmlFor="billing-email">Billing Email</label>
              <input
                id="billing-email"
                type="email"
                value={billingEmail}
                onChange={(e) => setBillingEmail(e.target.value)}
                className="w-full"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2 text-sm">
              <label htmlFor="billing-address">Billing Address</label>
              <textarea
                id="billing-address"
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                rows={4}
                className="w-full"
                placeholder="Flat/Street, City, State, ZIP"
              />
            </div>
          </section>

          <aside className="rounded-lg border border-border bg-card p-6 space-y-4 text-sm">
            <h2 className="text-base font-semibold text-gray-200">Payment Summary</h2>
            <p className="text-muted">
              Booking ID: <span className="text-gray-200">{bookingId}</span>
            </p>
            <p className="text-muted">
              Amount: <span className="text-gray-200">{totalAmount}</span>
            </p>
            <p className="text-muted">
              Method: <span className="text-gray-200 uppercase">{method}</span>
            </p>

            {bookingExpired && (
              <p className="text-xs text-danger">Your seat lock has expired. Go back and book again.</p>
            )}

            {error && <p className="text-xs text-danger">{error}</p>}

            <Button onClick={handleConfirmPayment} disabled={processing || bookingExpired}>
              {processing ? "Processing..." : "Confirm Payment"}
            </Button>

            <Button variant="secondary" onClick={() => navigate(-1)}>
              Back
            </Button>
          </aside>
        </div>
      </PageWrapper>
    </>
  );
}
