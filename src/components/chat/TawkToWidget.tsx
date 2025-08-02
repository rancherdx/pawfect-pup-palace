import React, { useEffect } from 'react';

// --- Tawk.to Configuration ---
// In a real application, these values would ideally be fetched from your
// `third_party_integrations` settings via an API or context,
// where 'service_name' is 'Tawkto' (or similar).
// The 'api_key' could store the Property ID, and 'other_config' (JSON) could store the Widget ID.
// Example: other_config: { "widgetId": "default" }

// FOR TESTING: Replace with your actual Property ID to see the widget load.
// If you don't have one, leave as is to see the placeholder.
const TAWK_TO_PROPERTY_ID = 'YOUR_TAWK_TO_PROPERTY_ID'; // e.g., '60c8a1b2b1d06a4dd1c0a1b2'
const TAWK_TO_WIDGET_ID = 'default'; // e.g., 'default' or a specific widget ID like 'chat_widget_1'

const TawkToWidget: React.FC = () => {
  useEffect(() => {
    // Check if the Property ID is still the placeholder value.
    if (TAWK_TO_PROPERTY_ID === 'YOUR_TAWK_TO_PROPERTY_ID' || !TAWK_TO_PROPERTY_ID) {
      console.warn(
        'Tawk.to Widget: TAWK_TO_PROPERTY_ID is a placeholder or not set. ' +
        'The chat widget will not load. Please configure it via admin settings.'
      );

      // Optional: Render a placeholder UI element indicating chat is unavailable or needs setup.
      // This is a simple way to provide visual feedback without altering the component's null return.
      const placeholderId = 'tawkto-placeholder-message';
      let placeholderDiv = document.getElementById(placeholderId);
      if (!placeholderDiv) {
        placeholderDiv = document.createElement('div');
        placeholderDiv.id = placeholderId;
        placeholderDiv.style.position = 'fixed';
        placeholderDiv.style.bottom = '20px';
        placeholderDiv.style.right = '20px';
        placeholderDiv.style.padding = '10px 15px';
        placeholderDiv.style.background = '#f0f0f0';
        placeholderDiv.style.color = '#333';
        placeholderDiv.style.border = '1px solid #ccc';
        placeholderDiv.style.borderRadius = '8px';
        placeholderDiv.style.fontFamily = 'Arial, sans-serif';
        placeholderDiv.style.fontSize = '14px';
        placeholderDiv.style.zIndex = '9998'; // Below Tawk.to's typical z-index
        placeholderDiv.textContent = 'Live Chat (Offline - Needs Setup)';
        document.body.appendChild(placeholderDiv);
      }

      return () => {
        // Cleanup the placeholder if the component unmounts
        const existingPlaceholder = document.getElementById(placeholderId);
        if (existingPlaceholder) {
          document.body.removeChild(existingPlaceholder);
        }
      };
    } else {
      // --- Actual Tawk.to Script Loading Logic ---
      // This is the standard embed script provided by Tawk.to.
      // It should work as is if TAWK_TO_PROPERTY_ID and TAWK_TO_WIDGET_ID are correctly set.
      console.log(
        `Tawk.to Widget: Initializing with Property ID: ${TAWK_TO_PROPERTY_ID} and Widget ID: ${TAWK_TO_WIDGET_ID}`
      );

      // Ensure Tawk_API is globally available for the script
      (window as Record<string, unknown>).Tawk_API = (window as Record<string, unknown>).Tawk_API || {};
      (window as Record<string, unknown>).Tawk_LoadStart = new Date();

      const s1 = document.createElement("script");
      const s0 = document.getElementsByTagName("script")[0];

      s1.async = true;
      s1.src = `https://embed.tawk.to/${TAWK_TO_PROPERTY_ID}/${TAWK_TO_WIDGET_ID}`;
      s1.charset = 'UTF-8';
      s1.setAttribute('crossorigin', '*');

      if (s0 && s0.parentNode) {
        s0.parentNode.insertBefore(s1, s0);
      } else {
        // Fallback if no script tag exists (shouldn't happen in typical HTML doc)
        document.head.appendChild(s1);
      }
      // The subtask asked for an alert if not a placeholder.
      // However, the actual script loading is preferred if the ID is set.
      // alert('Tawk.to script is attempting to load with your provided IDs.');
    }
  }, []); // Empty dependency array ensures this runs once on mount

  return null; // Tawk.to widget injects its own UI elements into the page
};

export default TawkToWidget;
