# Focus Blocker - Detailed Documentation

## Overview

Focus Blocker is a browser extension designed to prevent websites from detecting when you switch tabs, lose focus, or when the page visibility changes. This extension intercepts and blocks focus-related events and visibility change events across all websites, providing users with greater privacy and control over their browsing experience.

## Features

### Core Functionality

1. **Event Blocking**
   - Blocks `focus`, `blur`, `focusin`, and `focusout` events
   - Blocks `visibilitychange` events (including vendor-specific variants: `webkitvisibilitychange`, `mozvisibilitychange`, `msvisibilitychange`)
   - Prevents websites from detecting tab switches or window focus changes
   - Intercepts both event listeners and inline event handlers

2. **Domain Blacklist**
   - Configure domains where the extension should be disabled
   - Supports wildcard patterns (e.g., `*.example.com`)
   - Automatically matches subdomains
   - Useful for sites that require focus detection to function properly

3. **Copy Helper**
   - Visual highlighting of elements when holding Ctrl/Cmd
   - Quick text copying with Ctrl/Cmd + Alt
   - Customizable border color and opacity
   - Helps with copying text from sites that prevent normal selection

4. **Global Toggle**
   - Quick enable/disable from the popup interface
   - Status indicator shows current state
   - Displays current domain information

## Technical Details

### Architecture

The extension consists of several components:

- **Content Scripts**: Run in the page context to intercept and block events
- **Settings Bridge**: Communicates settings between the extension and page context
- **Popup Interface**: Provides user controls and status display
- **Options Page**: Full settings configuration interface

### Event Interception

The extension uses several techniques to block events:

1. **Prototype Override**: Overrides `EventTarget.prototype.addEventListener` and `removeEventListener` to prevent registration of blocked events
2. **Event Dispatch Blocking**: Intercepts `dispatchEvent` to prevent manual event triggering
3. **Property Override**: Overrides visibility-related document properties (`hidden`, `visibilityState`, etc.)
4. **Handler Installation**: Installs capture-phase event handlers to stop event propagation

### Settings Storage

All settings are stored in `chrome.storage.sync`, allowing synchronization across devices when signed into Chrome.

## Configuration

### Blocked Events

You can configure which events to block in the settings page:
- `visibilitychange` - Standard visibility change event
- `webkitvisibilitychange` - WebKit variant
- `mozvisibilitychange` - Mozilla variant
- `msvisibilitychange` - Microsoft variant
- `blur` - Window blur event
- `focus` - Window focus event
- `focusin` - Focus entering event
- `focusout` - Focus leaving event

### Blacklist Domains

Add domains where the extension should not work. Format:
- One domain per line
- Supports wildcards: `*.example.com`
- Automatically matches subdomains: `example.com` matches `www.example.com`

### Copy Helper Settings

- **Enable Highlighting**: Show visual border when hovering with Ctrl/Cmd pressed
- **Border Color**: Customize the highlight border color
- **Border Opacity**: Adjust the visibility of the highlight border

## Use Cases

1. **Privacy**: Prevent websites from tracking when you switch tabs
2. **Productivity**: Avoid interruptions from sites that pause when you switch tabs
3. **Testing**: Test how sites behave without focus detection
4. **Accessibility**: Help with copying text from sites with restricted selection

## Browser Compatibility

Designed for Chromium-based browsers (Chrome, Edge, Brave, etc.) using Manifest V3.

## Development

### Project Structure

```
focus-blocker-main/
├── manifest.json          # Extension manifest
├── assets/                # Icons and images
├── public/                # HTML interfaces
│   ├── popup.html        # Popup interface
│   └── options.html      # Settings page
└── src/                   # JavaScript source files
    ├── content.js        # Main content script
    ├── settings-bridge.js # Settings communication
    ├── copy-helper.js    # Copy helper functionality
    ├── popup.js          # Popup logic
    └── options.js        # Settings page logic
```

### Building

No build process required. The extension can be loaded directly from the source directory.

## Version

Current version: 2.0.0

## License

Unlicense - This is free and unencumbered software released into the public domain.

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/The-Open-Tech-Company/focus-block-browser).
