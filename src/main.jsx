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
import { Documentation } from "./components/Documentation";
import { Partners } from "./components/Partners";
import { Faq } from "./components/Faq";
import { Footer } from "./components/Footer";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollToTickets = () => document.getElementById("tiket")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">Lewati ke konten utama</a>
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} onTicketClick={scrollToTickets} />
      <main id="main-content">
        <CinematicHero onTicketClick={scrollToTickets} />
        <EventOverview onTicketClick={scrollToTickets} />
        <Schedule />
        <Speakers />
        <TicketSection />
        <Venue />
        <Documentation />
        <Partners />
        <Faq />
        <Footer onTicketClick={scrollToTickets} />
      </main>
      <div className="mobile-ticket-bar">
        <div><small>Status tiket</small><strong>Segera diumumkan</strong></div>
        <button className="btn btn-primary" onClick={scrollToTickets}>Info Tiket</button>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
