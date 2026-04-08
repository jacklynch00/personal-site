import type React from 'react';

export const toolbarContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '4px 6px',
  background: '#f5f5f5',
  border: '1px solid #ddd',
  borderRadius: '4px 4px 0 0',
  flexWrap: 'wrap',
  gap: '4px',
};

export const toolbarBtnStyle: React.CSSProperties = {
  padding: '4px 8px',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '0.82rem',
  fontFamily: 'inherit',
  borderRadius: '3px',
  color: '#333',
  lineHeight: 1.2,
};

export const toolbarBtnActiveStyle: React.CSSProperties = {
  ...toolbarBtnStyle,
  background: '#e0e0e0',
  color: '#000',
};

export const backdropStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.3)',
  zIndex: 999,
};

export const modalStyle: React.CSSProperties = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  background: '#fff',
  borderRadius: '8px',
  padding: '1.5rem',
  zIndex: 1000,
  width: 'min(24rem, 90vw)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
};

export const tabStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  borderBottom: '2px solid transparent',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  padding: '0.25rem 0.5rem',
};

export const modalInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem',
  border: '1px solid #ddd',
  borderRadius: '4px',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

export const modalButtonStyle: React.CSSProperties = {
  padding: '0.5rem 1.25rem',
  border: '1px solid #ddd',
  borderRadius: '4px',
  background: '#000',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontFamily: 'inherit',
};

export const slashMenuStyle: React.CSSProperties = {
  position: 'absolute',
  background: '#fff',
  border: '1px solid #ddd',
  borderRadius: '6px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
  padding: '4px',
  zIndex: 100,
  minWidth: '12rem',
  maxHeight: '20rem',
  overflow: 'auto',
};

export const slashMenuItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '6px 10px',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontFamily: 'inherit',
  borderRadius: '4px',
  width: '100%',
  textAlign: 'left',
  color: '#333',
};

export const slashMenuItemActiveStyle: React.CSSProperties = {
  ...slashMenuItemStyle,
  background: '#f0f0f0',
};

export const tableMenuStyle: React.CSSProperties = {
  position: 'absolute',
  background: '#fff',
  border: '1px solid #ddd',
  borderRadius: '6px',
  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
  padding: '4px',
  zIndex: 100,
  minWidth: '10rem',
};

export const tableMenuItemStyle: React.CSSProperties = {
  display: 'block',
  padding: '6px 10px',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '0.82rem',
  fontFamily: 'inherit',
  borderRadius: '3px',
  width: '100%',
  textAlign: 'left',
  color: '#333',
};
