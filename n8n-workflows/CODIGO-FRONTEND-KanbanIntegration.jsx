// =============================================================
// NUTRIBUDDY - KANBAN INTEGRATION EXAMPLE
// =============================================================
// Arquivo: KanbanIntegration.jsx
// Exemplo de como integrar o WhatsApp Status Card no Kanban
// =============================================================

import React, { useState } from 'react';
import WhatsAppStatusCard from './WhatsAppStatusCard';
import WhatsAppQRCode from './WhatsAppQRCode';
import './KanbanIntegration.css';

// =============================================================
// COMPONENTE: Modal simples
// =============================================================
const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          {title && <h3>{title}</h3>}
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

// =============================================================
// OPÇÃO 1: Integração no Sidebar do Kanban
// =============================================================
export const KanbanWithSidebar = () => {
  const [showQRModal, setShowQRModal] = useState(false);

  return (
    <div className="kanban-container">
      {/* SIDEBAR */}
      <aside className="kanban-sidebar">
        <h2>Dashboard</h2>

        {/* WhatsApp Status Card */}
        <WhatsAppStatusCard 
          onOpenQRCode={() => setShowQRModal(true)}
          refreshInterval={30000} // Atualizar a cada 30s
        />

        {/* Outros cards do sidebar */}
        <div className="sidebar-card">
          <h4>📊 Estatísticas</h4>
          <p>Pacientes ativos: 25</p>
        </div>

        <div className="sidebar-card">
          <h4>📅 Hoje</h4>
          <p>5 consultas agendadas</p>
        </div>
      </aside>

      {/* MAIN CONTENT - Kanban Board */}
      <main className="kanban-main">
        <h1>Kanban - Pacientes</h1>
        
        <div className="kanban-columns">
          {/* Suas colunas do Kanban aqui */}
          <div className="kanban-column">
            <h3>Em andamento</h3>
            {/* Cards dos pacientes */}
          </div>
          
          <div className="kanban-column">
            <h3>Aguardando</h3>
            {/* Cards dos pacientes */}
          </div>
        </div>
      </main>

      {/* MODAL QR CODE */}
      <Modal 
        isOpen={showQRModal} 
        onClose={() => setShowQRModal(false)}
        title="Conectar WhatsApp"
      >
        <WhatsAppQRCode />
      </Modal>
    </div>
  );
};

// =============================================================
// OPÇÃO 2: Integração no Header do Kanban
// =============================================================
export const KanbanWithHeader = () => {
  const [showQRModal, setShowQRModal] = useState(false);

  return (
    <div className="kanban-container-full">
      {/* HEADER */}
      <header className="kanban-header">
        <div className="header-left">
          <h1>NutriBuddy Kanban</h1>
          <p>Gerenciamento de Pacientes</p>
        </div>

        <div className="header-right">
          {/* WhatsApp Status - Versão compacta */}
          <div className="header-whatsapp">
            <WhatsAppStatusCard 
              onOpenQRCode={() => setShowQRModal(true)}
              className="compact"
            />
          </div>

          {/* User menu */}
          <div className="user-menu">
            <img src="/avatar.png" alt="User" />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="kanban-main">
        <div className="kanban-columns">
          {/* Suas colunas aqui */}
        </div>
      </main>

      {/* MODAL QR CODE */}
      <Modal 
        isOpen={showQRModal} 
        onClose={() => setShowQRModal(false)}
        title="Conectar WhatsApp"
      >
        <WhatsAppQRCode />
      </Modal>
    </div>
  );
};

// =============================================================
// OPÇÃO 3: Card flutuante (floating button)
// =============================================================
export const KanbanWithFloatingCard = () => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="kanban-container">
      {/* Seu Kanban normal */}
      <div className="kanban-main">
        {/* Suas colunas aqui */}
      </div>

      {/* FLOATING WHATSAPP STATUS */}
      <div className={`floating-whatsapp ${isExpanded ? 'expanded' : ''}`}>
        {isExpanded ? (
          <div className="floating-expanded">
            <button 
              className="floating-close"
              onClick={() => setIsExpanded(false)}
            >
              ✕
            </button>
            <WhatsAppStatusCard 
              onOpenQRCode={() => {
                setIsExpanded(false);
                setShowQRModal(true);
              }}
            />
          </div>
        ) : (
          <button 
            className="floating-button"
            onClick={() => setIsExpanded(true)}
            title="Status WhatsApp"
          >
            <span className="floating-icon">💬</span>
          </button>
        )}
      </div>

      {/* MODAL QR CODE */}
      <Modal 
        isOpen={showQRModal} 
        onClose={() => setShowQRModal(false)}
        title="Conectar WhatsApp"
      >
        <WhatsAppQRCode />
      </Modal>
    </div>
  );
};

// =============================================================
// OPÇÃO 4: Dashboard completo com múltiplos widgets
// =============================================================
export const Dashboard = () => {
  const [showQRModal, setShowQRModal] = useState(false);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard NutriBuddy</h1>
      </header>

      <div className="dashboard-grid">
        {/* Widget WhatsApp */}
        <div className="dashboard-widget whatsapp-widget">
          <WhatsAppStatusCard 
            onOpenQRCode={() => setShowQRModal(true)}
          />
        </div>

        {/* Outros widgets */}
        <div className="dashboard-widget">
          <h3>📊 Pacientes Ativos</h3>
          <div className="widget-content">
            <p className="widget-number">25</p>
            <p className="widget-label">Total</p>
          </div>
        </div>

        <div className="dashboard-widget">
          <h3>📈 Refeições Hoje</h3>
          <div className="widget-content">
            <p className="widget-number">87</p>
            <p className="widget-label">Registradas</p>
          </div>
        </div>

        <div className="dashboard-widget">
          <h3>⭐ Taxa de Aderência</h3>
          <div className="widget-content">
            <p className="widget-number">92%</p>
            <p className="widget-label">Média</p>
          </div>
        </div>
      </div>

      {/* MODAL QR CODE */}
      <Modal 
        isOpen={showQRModal} 
        onClose={() => setShowQRModal(false)}
        title="Conectar WhatsApp"
      >
        <WhatsAppQRCode />
      </Modal>
    </div>
  );
};

// =============================================================
// Export default (escolha a opção que preferir)
// =============================================================
export default KanbanWithSidebar;

// =============================================================
// USO:
// 
// import { KanbanWithSidebar } from './KanbanIntegration';
// 
// function App() {
//   return <KanbanWithSidebar />;
// }
// 
// =============================================================

