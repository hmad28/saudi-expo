import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

import { Navbar } from "./components/Navbar";
import { CinematicHero } from "./components/CinematicHero";
import { EventOverview } from "./components/EventOverview";
import { Schedule } from "./components/Schedule";
import { Speakers } from "./components/Speakers";
import { TicketSection } from "./components/TicketSection";
import { Venue } from "./components/Venue";
import { Partners } from "./components/Partners";
import { Faq } from "./components/Faq";
import { Footer } from "./components/Footer";
import { CheckoutModal } from "./components/CheckoutModal";
import { TicketPassModal } from "./components/TicketPassModal";
import { TicketLookupModal } from "./components/TicketLookupModal";
import { AdminDashboard } from "./components/AdminDashboard";
import { getStoredDatabase } from "./utils/storage";

function App() {
  const [db, setDb] = useState(() => getStoredDatabase());
  const [activeMode, setActiveMode] = useState("landing");
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeAccessToken, setActiveAccessToken] = useState(null);

  const refreshDb = () => setDb(getStoredDatabase());
  const startCheckout = (ticket = db.ticketTypes.find((item) => item.featured) || db.ticketTypes[0]) => {
    setSelectedTicket(ticket);
  };

  const handleCheckoutSuccess = (token) => {
    setSelectedTicket(null);
    setActiveAccessToken(token);
    refreshDb();
  };

  return (
    <div className="app">
      {activeMode !== "admin" && (
        <>
          <Navbar
            activeMode={activeMode}
            setActiveMode={setActiveMode}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            onBuyClick={() => startCheckout()}
          />
          <main>
            <CinematicHero onBuyClick={() => startCheckout()} />
            <EventOverview
              onBuyClick={() => startCheckout()}
              onLookupClick={() => setActiveMode("lookup")}
            />
            <Schedule />
            <Speakers />
            <TicketSection ticketTypes={db.ticketTypes} onSelectTicket={startCheckout} />
            <Venue />
            <Partners />
            <Faq />
            <Footer onBuyClick={() => startCheckout()} />
          </main>
          <div className="mobile-ticket-bar">
            <div><small>Tiket mulai</small><strong>Rp85.000</strong></div>
            <button className="btn btn-primary" onClick={() => startCheckout()}>Beli Tiket</button>
          </div>
        </>
      )}

      {activeMode === "admin" && (
        <AdminDashboard
          onClose={() => setActiveMode("landing")}
          onOpenPass={(token) => setActiveAccessToken(token)}
        />
      )}

      {selectedTicket && (
        <CheckoutModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {activeAccessToken && (
        <TicketPassModal accessToken={activeAccessToken} onClose={() => setActiveAccessToken(null)} />
      )}

      {activeMode === "lookup" && (
        <TicketLookupModal
          onClose={() => setActiveMode("landing")}
          onOpenPass={(token) => {
            setActiveMode("landing");
            setActiveAccessToken(token);
          }}
        />
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
