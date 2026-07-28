import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { BentoStats } from "./components/BentoStats";
import { About } from "./components/About";
import { Program } from "./components/Program";
import { ScholarshipSpotlight } from "./components/ScholarshipSpotlight";
import { Speakers } from "./components/Speakers";
import { Schedule } from "./components/Schedule";
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
  const [db, setDb] = useState(getStoredDatabase());
  const [activeMode, setActiveMode] = useState("landing"); // 'landing', 'lookup', 'admin'
  const [menuOpen, setMenuOpen] = useState(false);

  // Selected Ticket for Checkout Modal
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Active Ticket Access Token for Digital Pass Modal
  const [activeAccessToken, setActiveAccessToken] = useState(null);

  // Reload database state
  const refreshDb = () => {
    setDb(getStoredDatabase());
  };

  useEffect(() => {
    refreshDb();
  }, [activeMode, selectedTicket, activeAccessToken]);

  const handleStartCheckout = (ticket = db.ticketTypes[1]) => {
    setSelectedTicket(ticket);
  };

  const handleCheckoutSuccess = (token) => {
    setSelectedTicket(null);
    setActiveAccessToken(token);
    refreshDb();
  };

  return (
    <div className="app-container">
      {/* LANDING & PUBLIC MODES */}
      {activeMode !== "admin" && (
        <main id="top">
          <Navbar
            activeMode={activeMode}
            setActiveMode={setActiveMode}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            onBuyClick={() => handleStartCheckout()}
          />

          <Hero onBuyClick={() => handleStartCheckout()} />
          <BentoStats />
          <About />
          <Program />
          <ScholarshipSpotlight />
          <Speakers />
          <Schedule />
          <TicketSection
            ticketTypes={db.ticketTypes}
            onSelectTicket={(ticket) => handleStartCheckout(ticket)}
          />
          <Venue />
          <Partners />
          <Faq />
          <Footer onBuyClick={() => handleStartCheckout()} />
        </main>
      )}

      {/* ADMIN DASHBOARD MODE */}
      {activeMode === "admin" && (
        <AdminDashboard
          onClose={() => setActiveMode("landing")}
          onOpenPass={(token) => setActiveAccessToken(token)}
        />
      )}

      {/* CHECKOUT MODAL */}
      {selectedTicket && (
        <CheckoutModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {/* DIGITAL TICKET PASS MODAL */}
      {activeAccessToken && (
        <TicketPassModal
          accessToken={activeAccessToken}
          onClose={() => setActiveAccessToken(null)}
        />
      )}

      {/* PUBLIC TICKET LOOKUP MODAL */}
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

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
