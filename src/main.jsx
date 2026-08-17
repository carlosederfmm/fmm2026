import App from './App.jsx';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

const root = ReactDOM.createRoot(rootEl);
root.render(React.createElement(App));

// Ensure icons are created after hydration
if (window.lucide) window.lucide.createIcons();
