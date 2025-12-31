# **Temporal Engineering: Architectural Paradigms for Open-Source "4000 Weeks" Life Visualizers**

## **Executive Summary**

The digitization of the *memento mori*—the ancient stoic practice of reflecting on mortality—has found its modern expression in the "Life Calendar" or "4000 Weeks" visualizer. Popularized by Oliver Burkeman’s treatise *Four Thousand Weeks: Time Management for Mortals* and Tim Urban’s "Your Life in Weeks," this concept reimagines the calendar not as a tool for scheduling future appointments, but as a bounded grid representing the entirety of a human lifespan. Unlike standard productivity applications that imply infinite future availability, the Life Calendar creates urgency and perspective by visualizing the finite nature of time—approximately 4,160 weeks for an eighty-year life.

This research report provides an exhaustive technical and design analysis for engineering open-source Life Calendar Single Page Applications (SPAs) using TypeScript. It departs from the conventional cloud-SaaS model to advocate for a "Local-First" architectural pattern, prioritizing user sovereignty through browser-based Local Storage and standardized JSON file portability.

The analysis dissects the specific engineering challenges inherent in rendering high-density temporal grids, comparing the performance profiles of the Virtual DOM, Canvas, and virtualization libraries like react-window. It further explores the nuanced requirements of TypeScript state management for complex date logic, the psychological considerations of user onboarding for mortality-centric interfaces, and the robust implementation of persistence layers that function without server dependencies. By synthesizing data from open-source repositories, technical documentation, and user experience case studies, this report establishes a comprehensive framework for developers aiming to build enduring, privacy-focused tools for life visualization.

## **1\. The Philosophical and Functional Requirements of Finite Time**

To engineer a tool that effectively visualizes the scarcity of time, one must first deconstruct the underlying philosophy that drives its usage. The application is not merely a utility for tracking dates; it is a mechanism for cognitive reframing. The architectural decisions—from the grid layout to the color palette—must serve the psychological goal of combating "temporal discounting," the human tendency to view the future as an abstract, infinite resource disconnected from the present moment.

### **1.1 The "4000 Weeks" Conceptual Framework**

The core metric of the application is the "Week." While days are too granular (resulting in over 29,000 units for an average life, creating visual noise) and years are too broad (hiding the texture of life’s phases), the week offers a perfect balance of granularity and comprehensive visibility. Oliver Burkeman’s philosophy posits that acknowledging the limit of 4,000 weeks forces a prioritization of meaningful engagement over efficiency.

This philosophical stance translates into specific functional requirements for the software. The application must present the "Whole Life" view as the default state, resisting the urge to hide past years in archives. The user interface must enforce a visual confrontation with the ratio of "Used Time" to "Remaining Time." This requirement distinguishes the Life Calendar from standard calendar apps like Google Calendar or Outlook, which focus on the micro-management of the immediate future while obscuring the macro-scale of the lifespan. The target user persona for such a tool is often introspection-oriented, valuing privacy, minimalism, and data ownership, which strongly supports the decision to utilize open-source, local-first architectures rather than proprietary cloud services.

### **1.2 User Personas and Technical Demands**

The open-source nature of the project attracts a specific demographic of users and contributors. We identify three primary personas that drive the feature set and technical constraints:

* **The Stoic Pragmatist:** This user seeks a "set it and forget it" tool that serves as a high-level dashboard. They require a minimalist aesthetic—typically high-contrast monochrome—and low friction. They are adverse to login walls, newsletters, and subscription models, making a Local Storage implementation ideal.  
* **The Quantified Self Enthusiast:** This user views the calendar as a database of their existence. They require rich annotation features, the ability to tag "Eras" (e.g., University, Career Gap, Parenthood), and, crucially, the ability to export their data in machine-readable formats (JSON) for analysis in other tools. They demand a rigid schema and data validation.  
* **The Privacy Advocate:** Given that a Life Calendar often contains sensitive personal history—medical events, relationship milestones, private failures—this user rejects cloud storage. They require cryptographic assurances that their data never leaves the client-side session. This necessitates a "Zero-Knowledge" architecture where the application acts solely as a logic layer over locally stored data.

### **1.3 Core Application Features**

Based on an analysis of existing open-source projects and commercial analogues, a "Complete" Life Calendar SPA must implement the following feature set:

| Feature Category | Core Requirement | Technical Implication |
| :---- | :---- | :---- |
| **Visualization** | 52-column x 90-row Grid | High-performance rendering of \~4,680 nodes. |
| **Temporal State** | Auto-calculation of Past/Present/Future | Robust date math library (e.g., date-fns) to handle leap years/weeks. |
| **Annotation** | "Eras" spanning multiple weeks | Logic to map date ranges to grid indices; z-index layering strategies. |
| **Persistence** | Instant save state | localStorage hooks with debounce/throttling to prevent I/O blocking. |
| **Portability** | JSON Export/Import | Schema validation (Zod/Yup) and FileReader API integration. |
| **Theming** | Dark/Light Mode | CSS Variables or Tailwind utility classes toggled via Context. |

## **2\. Landscape Analysis of Open-Source Solutions**

The current landscape of open-source Life Calendars is fragmented, characterized by numerous "weekend projects" that implement the basic grid but lack robust persistence or advanced features. Analyzing these repositories provides critical insights into common pitfalls and best practices.

### **2.1 Repository: memento-mori (ronilaukkarinen/afonsocrg)**

The memento-mori family of repositories represents the "Traditional Web" approach. These projects typically utilize vanilla HTML, CSS, and JavaScript. The logic is straightforward: generate a table or a series of divs based on a user's birthdate input.

* **Strengths:** These implementations are extremely lightweight. Without the overhead of a framework like React, the initial load time is instantaneous. They often include "Print Stylesheets," acknowledging that many users prefer a physical paper version of the calendar—a feature often overlooked in complex SPAs.  
* **Weaknesses:** The lack of a component-based architecture makes state management difficult. Adding interactivity—such as clicking a specific week to add a journal entry—requires manual DOM event listeners and manipulation, which becomes unmaintainable as complexity grows. Persistence is often absent or limited to cookies, which are less durable than Local Storage.  
* **Implementation Note:** The rendering logic in these repos often struggles with the "52 weeks vs. 365 days" discrepancy, sometimes resulting in grids that drift out of sync with actual calendar years over decades.

### **2.2 Repository: life-in-weeks (gauravkrp)**

This repository represents the "Modern App" approach, utilizing Next.js, TypeScript, and Tailwind CSS. It treats the visualizer as a product rather than just a script.

* **Strengths:** The use of TypeScript ensures that the data structures for weeks and events are strictly typed, reducing runtime errors. The integration of Tailwind CSS allows for rapid theming and responsive design. This project typically includes a toggle between "Grid View" and "Graph View," acknowledging that different visualizations resonate with different users.  
* **Weaknesses:** Being a Next.js application often implies a server-side component or a build process that is heavier than necessary for a purely client-side tool. While it supports deployment to Vercel/Netlify, the complexity of the React hydration process can introduce bugs with Local Storage if not handled correctly (e.g., the "flash of unstyled content" or hydration mismatches when client storage differs from server defaults).

### **2.3 Repository: lifeweeks (stephenturner)**

This project takes a data-science approach, offering implementations in Python and R (Shiny) alongside HTML.

* **Strengths:** It emphasizes the generation of static artifacts (PDFs) and precise calculation. The Python backend ensures mathematical accuracy in week calculations.  
* **Weaknesses:** As a web application, it lacks the interactivity of an SPA. It is a "Generator" rather than a "Manager." It does not support the ongoing annotation of life events or the interactive exploration of eras, limiting its utility to a one-time visualization rather than a daily companion.

## **3\. Architectural Strategy: The Local-First TypeScript SPA**

The consensus among modern frontend engineering principles points toward a Local-First architecture for personal informatics tools. This approach combines the responsiveness of client-side apps with the reliability of file-based systems. We select a stack optimized for type safety, performance, and longevity.

### **3.1 Technology Stack Selection**

For a robust, maintainable open-source project, the following stack is recommended:

* **Language: TypeScript.** The complexity of date manipulation—handling leap years, timezone offsets, and the conversion between ISO strings and Date objects—is a primary source of bugs in calendar applications. TypeScript’s static typing enforces discipline, ensuring that a "Date" is always processed correctly and that the JSON schema for exported data remains consistent.  
* **Framework: React.** While vanilla JS is lighter, React’s ecosystem provides the necessary primitives for virtualization (react-window) and efficient state management (Context/Hooks). The component model is essential for creating reusable "Week Cells" that can handle complex interaction logic (tooltips, clicks, drag-selection) without resulting in spaghetti code.  
* **Build Tool: Vite.** Vite offers a significantly faster development experience than older tools like Webpack. Its native support for ES modules and fast Hot Module Replacement (HMR) facilitates rapid iteration. Crucially, Vite produces highly optimized static assets, perfect for deploying the app to GitHub Pages or any static host, ensuring the "serverless" requirement is met.  
* **State Management: React Context \+ Custom Hooks.** For a strictly local app, external libraries like Redux are often overkill. A custom hook wrapping localStorage (e.g., useLocalStorage) combined with React Context provides a sufficient mechanism for global state management. This keeps the bundle size small and the architecture transparent.

### **3.2 The "No-Backend" Pattern and Data Sovereignty**

By eschewing a backend database, the application achieves a "Zero-Liability" security posture.

* **Cost Efficiency:** The app can be hosted entirely on free static CDNs. There are no database hosting costs, no API limits, and no server maintenance requirements.  
* **Privacy:** No user data is ever transmitted over the network. This is a critical selling point for users who may use the calendar to track sensitive health or personal milestones.  
* **Longevity:** "Link Rot" and "Service Sunset" are significant risks for cloud apps. A static SPA, once downloaded, can run offline indefinitely. The local-first architecture ensures that even if the original developer abandons the project, the user's tool continues to function without interruption.

### **3.3 Folder Structure and Modular Design**

A well-structured TypeScript project ensures maintainability. The recommended structure separates concerns between the data layer (storage, types) and the view layer (components).

/src  
/assets \# Static icons and global styles  
/components  
/Grid \# The Virtualized Grid logic  
LifeGrid.tsx \# Container managing the window  
WeekCell.tsx \# Individual cell presentation  
EraOverlay.tsx \# SVG overlay for life chapters  
/Controls \# Zoom, Pan, Date Input  
/Onboarding \# Wizard steps for initial setup  
/Modals \# Event entry and Era definition forms  
/hooks  
useLocalStorage.ts \# Persistence logic  
useLifeData.ts \# Context wrapper for global state  
useVirtualGrid.ts \# Logic for sizing and responsiveness  
/types  
schema.ts \# Zod schemas and TS Interfaces  
/utils  
dateMath.ts \# ISO 8601 logic, Leap week handling  
fileIO.ts \# FileReader and Blob logic  
exportHelpers.ts \# JSON serialization  
App.tsx  
main.tsx

## **4\. The Rendering Engine: Virtualization and Performance**

The most distinct technical challenge of a Life Calendar is the "Grid Problem." Rendering 4,680 individual interactive elements is trivial for a GPU but taxing for the browser's DOM engine if handled naively.

### **4.1 Comparative Analysis of Rendering Techniques**

We evaluate three primary approaches for rendering the life grid:

| Rendering Method | Implementation Complexity | Performance (60fps) | Accessibility | Recommendation |
| :---- | :---- | :---- | :---- | :---- |
| **Pure DOM (Flex/Grid)** | Low. Uses standard CSS Grid or Flexbox. | Poor. 5,000 nodes cause high RAM usage and "Recalculate Style" lag on resize. | High. Native semantic structure. | **Suitable for Desktop-only** or static views. |
| **Canvas (WebGL)** | High. Requires imperative drawing logic. | Excellent. Can render 100k+ particles smoothly. | Low. Canvas is a black box; requires manual ARIA management. | **Overkill** unless implementing complex particle effects. |
| **Virtualization** | Medium. Requires libraries like react-window. | High. Renders only visible nodes (\~100 items). | High. Maintains semantic DOM nodes for visible items. | **Preferred Architecture**. |

### **4.2 Implementing Virtualization with react-window**

For a "4000 Weeks" visualizer, **Windowing** is the optimal strategy. Libraries like react-window allow the application to logically represent a grid of 4,000 items while physically mounting only the \~100 nodes currently visible in the viewport. This dramatically reduces memory footprint and initial load time.

The implementation utilizes FixedSizeGrid. While life events are variable, the grid structure itself is uniform (52 columns).

* **Column Count:** 52 (representing the weeks of a year).  
* **Row Count:** 90 (representing a lifespan up to 90 years).  
* **Cell Data Calculation:** The data for any given cell is derived from its index: WeekID \= (RowIndex \* 52\) \+ ColumnIndex.

TypeScript Interface for Cell Props:  
The cell component must be strictly typed to handle the various states it can represent.

TypeScript

interface WeekCellProps {  
  weekIndex: number;          // Unique ID 0-4680  
  status: 'past' | 'present' | 'future';  
  isMilestone: boolean;       // Visual flag for significant events  
  eraColor?: string;          // Background color from overlaying Era  
  events?: LifeEvent;       // Array of events occurring in this week  
  onClick: (weekIndex: number) \=\> void;  
}

By wrapping the Cell component in React.memo, we ensure that only cells with changed data (e.g., a newly added event) trigger a re-render, keeping the interface snappy even during heavy interaction.

### **4.3 The "Leap Week" and Date Drift Challenge**

A calendar year is not exactly 52 weeks; it is 52 weeks plus 1 day (or 2 in a leap year). A strictly 52-column grid introduces a "drift" where the grid year falls behind the calendar year by approximately 1.25 weeks per decade. Over a 90-year lifespan, this drift accumulates to over 11 weeks.

* **The Precision Approach:** Some systems inject a 53rd week every 5-6 years (the "Leap Week" calendar). While mathematically accurate, this breaks the visual symmetry of the grid, creating jagged edges that disrupt the user's visual scan of "vertical years."  
* **The Abstraction Approach (Recommended):** For a philosophical visualizer, visual consistency supersedes astronomical precision. The recommended approach is to maintain a strict 52-week grid. The logic maps the *first* week of the year to Column 0 and the *last* week to Column 51, absorbing the extra days into the final week. This maintains the "1 Row \= 1 Year" mental model, which is crucial for the "Life in Weeks" visualization.

## **5\. Data Persistence: The Local Storage Pattern**

In a Local-First SPA, window.localStorage acts as the primary database. This requires careful engineering to ensure data safety, synchronization, and performance.

### **5.1 The useLocalStorage Hook Architecture**

The native localStorage API is synchronous and blocking. A naive implementation that reads/writes large JSON objects on every keystroke will freeze the main thread. We require a custom hook that manages this interaction efficiently.

**Advanced Hook Implementation Details:**

1. **Lazy Initialization:** The hook should only read from Local Storage once upon initialization. Subsequent reads should come from React state.  
2. **Serialization/Deserialization:** Data in Local Storage is string-based. The hook must robustly handle JSON.parse failures (e.g., if the user manually corrupts the data).  
3. **Cross-Tab Synchronization:** If a user has the app open in two tabs and updates data in one, the other must reflect the change. This is achieved by listening to the window's storage event.

TypeScript

// Conceptual Architecture of the Hook  
import { useState, useEffect, useCallback } from 'react';

function useLocalStorage\<T\>(key: string, initialValue: T): {  
  // 1\. Lazy Initialization  
  const \= useState\<T\>(() \=\> {  
    if (typeof window \=== 'undefined') return initialValue;  
    try {  
      const item \= window.localStorage.getItem(key);  
      return item? JSON.parse(item) : initialValue;  
    } catch (error) {  
      console.error("Storage Read Error", error);  
      return initialValue;  
    }  
  });

  // 2\. Set Value Wrapper  
  const setValue \= useCallback((value: T) \=\> {  
    try {  
      const valueToStore \= value instanceof Function? value(storedValue) : value;  
      setStoredValue(valueToStore);  
      if (typeof window\!== 'undefined') {  
        window.localStorage.setItem(key, JSON.stringify(valueToStore));  
        // Dispatch event for same-tab listeners if needed  
        window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(valueToStore) }));  
      }  
    } catch (error) {  
      console.error("Storage Write Error", error);  
    }  
  }, \[key, storedValue\]);

  // 3\. Sync Listener  
  useEffect(() \=\> {  
    const handleStorageChange \= (event: StorageEvent) \=\> {  
      if (event.key \=== key && event.newValue) {  
        setStoredValue(JSON.parse(event.newValue));  
      }  
    };  
    window.addEventListener('storage', handleStorageChange);  
    return () \=\> window.removeEventListener('storage', handleStorageChange);  
  }, \[key\]);

  return \[storedValue, setValue\];  
}

### **5.2 Storage Quotas and Data Management**

Browser Local Storage is typically capped at approximately 5MB per origin. While 5MB is substantial for plain text, a Life Calendar with extensive journaling or metadata could approach this limit over decades of use.

* **Compression Strategy:** To maximize space, the internal storage schema should use abbreviated keys (e.g., t for title, d for date) before serialization. However, for export, these should be mapped back to human-readable keys.  
* **Binary Data Exclusion:** The application must strictly prohibit the storage of binary assets (images, attachments) in Local Storage. If image support is required, the app should use IndexedDB or store only references (URLs) to external assets.

### **5.3 Persistence Risks and "Volatile" Storage**

It is a misconception that Local Storage is permanent. Browsers, particularly Safari (WebKit) on mobile, may aggressively clear Local Storage if the site has not been visited for 7 days (in certain ITP contexts).

* **Mitigation Strategy:** The UI must be aggressive about prompting for backups. A "Dirty State" indicator—a visual cue like a yellow "Unsaved Changes" dot—should appear whenever the local state diverges from the last exported file. This prompts the user to "Save to Disk," reinforcing the Local-First philosophy that the *file* is the source of truth, not the browser cache.

## **6\. Data Portability: File Export/Import Architecture**

True data ownership requires that the user can extract their data in a standardized, open format. The ubiquitous support for JSON makes it the obvious choice.

### **6.1 The Data Schema and TypeScript Interfaces**

A rigorous schema is essential for long-term compatibility. We define a versioned schema to allow for future migrations.

TypeScript

// Core Data Schema  
interface LifeCalendarData {  
  version: number;          // Semantic versioning for the data structure  
  meta: {  
    exportedAt: string;     // ISO Date  
    appName: string;  
  };  
  profile: {  
    birthDate: string;      // ISO 8601 YYYY-MM-DD  
    lifeExpectancy: number; // Years, e.g., 85  
    name: string;  
  };  
  eras: Era;              // Array of Life Chapters  
  events: LifeEvent;      // Array of discrete events  
}

interface LifeEvent {  
  id: string;               // UUID  
  date: string;             // ISO 8601  
  title: string;  
  description?: string;  
  type: 'milestone' | 'generic';  
  color?: string;           // Hex code  
}

interface Era {  
  id: string;  
  startDate: string;  
  endDate: string;  
  title: string;  
  color: string;  
}

### **6.2 Export Logic: The Blob Pattern**

Exporting data involves converting the state object into a JSON string and triggering a browser download.

* **Mechanism:** Create a Blob with the MIME type application/json. Use URL.createObjectURL(blob) to create a temporary anchor tag and programmatically click it.  
* **Filename Convention:** The filename should include the date (e.g., my-life-backup-2025-10-24.json) to allow users to maintain version history of their own lives.

### **6.3 Import Logic: Validation and Sanitation**

The Import function represents the highest risk for application stability. Importing a malformed or malicious JSON file could crash the SPA or introduce XSS vulnerabilities.

* **Validation Layer:** We employ **Zod**, a TypeScript-first schema validation library. Before any data is loaded into the state, it is parsed by Zod. If the schema does not match (e.g., missing birthDate, invalid date formats), the import is rejected with a clear error message.  
* **Date Normalization:** The importer acts as a sanitizer. It ensures that all dates are valid ISO strings. If the imported data uses legacy formats (e.g., MM/DD/YYYY), the importer normalizes them to ISO 8601 before storage.

## **7\. UI/UX Design Patterns for Mortality**

Designing an interface that confronts the user with their own mortality requires nuance. The UX must balance the "Shock of Finitude" with the "Agency of Planning."

### **7.1 Onboarding: The Gentle Introduction**

An immediate display of the full "Dead Grid" can cause high bounce rates due to anxiety.

* **Pattern: Progressive Disclosure.** The onboarding flow should reveal the grid in stages.  
  1. **Input:** Ask for Birth Date.  
  2. **The Number:** Display the number of weeks lived vs. left as a statistic first.  
  3. **The Week:** Show a single week unit. "This is a week. You have X left."  
  4. **The Reveal:** Animate the grid filling up. This animation visualizes the *passage* of time, making the static grid more meaningful.  
* **Contextualization:** Prompt the user to enter *one* happy memory immediately. This populates the "Past" section with a bright spot, transforming the gray void of "Dead Time" into a landscape of memory.

### **7.2 Visualizing Eras and Time Ranges**

A core requirement is the visualization of "Chapters" or "Eras" (e.g., High School, Marriage).

* **Interaction Design:** Defining a range on a grid is complex. A "Drag-Select" across multiple rows is intuitive but technically difficult to implement on a virtualized grid (where rows disappear).  
* **Recommended Pattern: Click-Start / Click-End.** The user clicks a week to mark the "Start" of an Era, then navigates (scrolls) to the "End" week and clicks again.  
* **Visual Representation:** Eras are best visualized as colored lines or brackets running along the left or right edge of the grid rows, rather than coloring the cell backgrounds (which is reserved for event density). This prevents visual conflicts when an Era overlaps with a specific Event.

### **7.3 Responsiveness: The Mobile Grid Challenge**

A 52-column grid is inherently wide. On a standard desktop monitor, each cell is distinct. On a mobile device (375px width), 52 columns result in \~5px wide cells, which are unclickable.

* **Anti-Pattern:** Reducing the column count (e.g., to 12\) on mobile. This breaks the "1 Row \= 1 Year" mental model.  
* **Strategy 1: Pan and Zoom.** Treat the grid like a map. Use a library like react-use-gesture to allow the user to pinch-zoom into specific years.  
* **Strategy 2: Read-Only Grid, List-View Edit.** On mobile, the grid serves as a visualizer (non-interactive). Tapping a "Year" row opens a detailed List View of that year’s weeks, where the user can easily tap to add events. This hybrid approach preserves the visualization while ensuring usability.

## **8\. Advanced Feature Sets and Future Proofing**

To compete with commercial apps, the open-source tool needs advanced capabilities that leverage the digital medium.

### **8.1 Recurring Events and Patterns**

Users have recurring life patterns (Birthdays, Anniversaries). Manually entering these 80 times is tedious.

* **Implementation:** Introduce a recurrence rule in the event schema (similar to iCal RFC 5545, but simplified).  
* **Render Logic:** When rendering a cell, the component checks if the cell's derived date matches any recurrence rules.  
  * *Optimization:* Pre-compute the recurrence map for the current viewport year to avoid calculating complex date rules for 4,000 cells on every render.

### **8.2 Statistics and "Life Dashboard"**

Beyond the grid, the app can offer a "Dashboard" view.

* **Metrics:** "Weeks until Retirement," "Percentage of Life Spent Sleeping (approx)," "Eras Duration Comparison."  
* **Visualization:** Use Chart.js or simple SVG bars to compare the lengths of different life chapters (e.g., "Time spent in Education" vs. "Time spent Working").

### **8.3 Theming and "Dark Mode" Philosophy**

Dark Mode is standard in modern SPAs, but for a Life Calendar, it has semantic weight.

* **Light Mode:** Often feels clinical, like a medical chart.  
* **Dark Mode:** Encourages reflection. The contrast of bright "Life Events" against a dark background mimics stars in the night sky, a fitting metaphor for the stoic reflection on life.  
* **Technical Implementation:** Use CSS variables (--bg-primary, \--cell-empty, \--cell-filled) controlled by a Theme Context. This allows for instantaneous theme switching without React re-renders, as only the CSS values change.

## **9\. Conclusion**

The engineering of an open-source "4000 Weeks" Life Calendar is a discipline of constraints. It requires balancing the **heaviness** of the dataset—an entire human life—with the **lightness** of the user interface. By adopting a **Local-First** architecture, we prioritize the user's privacy and the longevity of their data, ensuring the tool remains useful for decades, independent of cloud services. By utilizing **TypeScript and strict schemas**, we ensure the application is robust enough to handle the complex, messy reality of temporal data. And by employing **Virtualization**, we ensure the interface remains responsive, allowing the user to focus not on the technology, but on the profound realization of their own finite time.

This report establishes that such a tool is not merely a calendar, but a digital artifact of existence. The architectural principles outlined here—sovereignty, performance, and semantic clarity—provide the blueprint for building a visualizer that is worthy of the life it represents.

### ---

**Comparison of Key Open Source Repositories Analyzed**

| Repository | Tech Stack | Key Features | Limitations |
| :---- | :---- | :---- | :---- |
| **ronilaukkarinen/memento-mori** | HTML/JS/CSS | Simple, dark mode, JSON event support | No framework, hard to maintain state, manual DOM manipulation. |
| **afonsocrg/mementoMori** | HTML5/JS | Self-filling, printable view | Lack of interactivity for complex event planning. |
| **gauravkrp/life-in-weeks** | Next.js, TS, Tailwind | Modern UI, toggle views (grid/graph) | Focused on visualization, less on "life management" features. |
| **jjozic/memento-mori-react** | React, TS | Component-based, strict typing | Basic implementation, lacks advanced persistence features. |

### **Recommended Further Reading**

* **Oliver Burkeman:** *Four Thousand Weeks* (Philosophy of Finitude)  
* **Tim Urban:** *Wait But Why: Your Life in Weeks* (Visual Inspiration)  
* **Ink & Switch:** *Local-First Software* (Architectural Philosophy)  
* **Brian Vaughn:** *React Window Documentation* (Virtualization Technicals)