# Debug-Log-Analyzer
```python
print()
```
Drowning in debug logs? Spending too much time sifting through endless lines of text? Debug-Log-Analyzer might be the solution you're looking for.

This personal project is designed to help you declutter and analyze your debug logs more efficiently. It aims to highlight important information and present it in a more manageable format.

**How to Use:**
1.  **Open your debug log**
2.  **Activate the extension:**
    *   **Mac:** Press `Command+Shift+P`
    *   **Windows:** Press `Ctrl+Shift+P`
3.  **Search for the command:** Type "Analyze Debug Log" and select it.

The extension will then open a new tab with the analyzed and decluttered version of your log.

Give Debug-Log-Analyzer a try and see if it can help you streamline your debugging process!

## Streamlining Debugging: Key Features for Easier Log Analysis

Debugging can be a pain, especially when wading through mountains of log data. That's why I'm focusing on features designed to make log analysis quicker and more efficient. Here's what you can expect:

*   **Decluttered Logs:** We're removing unnecessary information from your logs to highlight the most important details and reduce visual noise.

*   **Checkbox Filtering:** Simplify your view with a checkbox system. Easily select and deselect specific log types to focus on the information you need.

*   **Search Functionality:** Quickly find specific events or patterns within your logs using a powerful search feature.

*   **Layered Levels for Nested Events:** Understand complex relationships with layered levels that visually represent nested events, making it easier to trace the flow of information.

These features are all designed to streamline your debugging process and help you identify issues faster. Stay tuned for more updates!

## Upcoming Features
* Add buttons to:
  * minimize everything and display only debug logs
  * minimize everything except exceptions and fatal errors.
* Add a button or a new tab to view a simplified stack trace

## Known Issues

* Large debug logs can cause a bit of lag when using show more/show less buttons and when using built in search bar
* Nested show more/show less buttons may not work properly when a checkbox filter has been adjusted
* Certain unique logs break the flow of the CSS indentation


## Release Notes

### 0.7.0

* Inclusion of Errors: The User Debugs tab now includes a section for errors, allowing users to view and address issues directly within the debugging interface.
* Redirect Feature: Users can now easily redirect from the debug tab to the main tab. This streamlines the process of searching and finding more information or related issues.
* Debug Log Levels Display: The top of the User Debugs tab now features a clear display of debug log levels, making it easier for users to understand what information will be available
* Statistics Panel: On the left-hand side, there is now a statistics panel that provides information on the number of SOQL queries, DML operations, debug logs, and errors that have occurred. This feature enhances visibility and allows users to monitor the system's performance effectively.

These updates should enhance user experience by making debugging more efficient and informative

### 0.5.0

* Implemented User Debugs tab for easier System Debug access

### 0.4.0

* Improved readability and fixed minor bugs

---

**Enjoy!**