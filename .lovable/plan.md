

# AirMockup — Interactive 3D Mockup Generator

## Overview
A browser-based prototyping tool that lets users map UI images onto a 3D smartphone mockup and control its rotation in real-time. Built with a clean, modern aesthetic inspired by Vercel/Stripe.

## Layout

### Left Sidebar (~320px, dark/sleek)
- **Header**: "AirMockup" branding + "Interactive 3D Mockup Generator" subtitle
- **Step 1 — Image Upload**: Drag-and-drop zone (react-dropzone), shows thumbnail preview after upload
- **Step 2 — Magic Link**: QR code (qrcode.react) + "Simulate Mobile Connection" toggle with animated Connected/Disconnected badge
- **Rotation Sliders**: 3 smooth range sliders for X, Y, Z axis control
- **Export Button**: "Capture Current View" — uses canvas toDataURL to download a screenshot

### Right Main Area (remaining space)
- Full-height @react-three/fiber Canvas with premium gradient background
- 3D smartphone placeholder built from Three.js primitives (RoundedBox body + Plane screen)
- Realistic lighting: AmbientLight, DirectionalLight, Environment preset, ContactShadows
- Float animation when not in "connected" mode; sliders override rotation

## 3D Smartphone Placeholder
- **Body**: RoundedBox with metallic dark material, slight border radius
- **Screen**: PlaneGeometry inset slightly, dynamically textured with uploaded image (or default gradient placeholder)
- **Camera notch**: Small primitive detail for realism
- Clean component boundary so the entire group can be swapped for a GLB model later

## Core Logic
- Image upload → Three.js texture via useTexture/TextureLoader → mapped to screen plane preserving aspect ratio
- Rotation: controlled via sliders (X/Y/Z state) or gentle Float animation
- "Simulate Mobile Connection" toggle: when ON, shows connected badge and disables Float
- Export: capture canvas as PNG download
- Framer Motion for sidebar transitions and UI polish

## Dependencies to Install
- @react-three/fiber@^8.18, @react-three/drei@^9.122.0, three@^0.160
- react-dropzone, qrcode.react, framer-motion

## File Structure
- `src/pages/Index.tsx` — main layout (sidebar + canvas)
- `src/components/airmockup/Sidebar.tsx` — all controls
- `src/components/airmockup/PhoneCanvas.tsx` — Canvas wrapper with lighting/shadows
- `src/components/airmockup/PhonePlaceholder.tsx` — primitive-based 3D phone (swap point for GLB)
- `src/components/airmockup/ImageDropzone.tsx` — drag-and-drop upload
- `src/components/airmockup/MagicLink.tsx` — QR code + connection toggle
- `src/components/airmockup/RotationSliders.tsx` — X/Y/Z sliders

