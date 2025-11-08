# Assumptions and Scope for A11y Contrast Checker Plugin

## WCAG References and Contrast Ratios

The plugin is designed to help designers comply with the Web Content Accessibility Guidelines (WCAG) for color contrast. Key points from WCAG 2.1 are:

- **Level AA contrast ratio requirements:** For normal text, the contrast ratio between foreground and background colours must be at least **4.5 : 1** ([Contrast Checker](https://webaim.org/resources/contrastchecker/#:~:text=Contrast%20Checker%20,5%3A1%20for%20large%20text)). For large text (typically 18.66 px bold or 24 px regular), the minimum ratio can be relaxed to **3 : 1** ([Contrast Checker](https://webaim.org/resources/contrastchecker/#:~:text=Contrast%20Checker%20,5%3A1%20for%20large%20text)). Active UI components and non-text graphics also require a minimum ratio of **3 : 1** (there is no AAA requirement for graphics) ([setPluginData 100kb size limit now being enforced](https://forum.figma.com/report-a-problem-6/setplugindata-100kb-size-limit-now-being-enforced-38987#:~:text=,Color%20contrast)).
- **Level AAA contrast ratio requirements:** For normal text, the contrast ratio must be at least **7 : 1** ([Contrast Checker](https://webaim.org/resources/contrastchecker/#:~:text=Contrast%20Checker%20,5%3A1%20for%20large%20text)). For large text, the minimum ratio is **4.5 : 1** ([Contrast Checker](https://webaim.org/resources/contrastchecker/#:~:text=Contrast%20Checker%20,5%3A1%20for%20large%20text)).
- These thresholds originate from research into visual acuity: 4.5 : 1 roughly compensates for vision loss equivalent to 20/40 vision, while 7 : 1 compensates for vision loss equivalent to 20/80 vision ([Understanding Success Criterion 1.4.6: Contrast (Enhanced)](https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html#:~:text=Understanding%20Success%20Criterion%201,FOZARD)).

The plugin will compute contrast ratios for text against its background and compare them to both AA and AAA thresholds. Large text will be classified according to WCAG (≥ 18.66 px bold or ≥ 24 px regular). When reporting results, the plugin should indicate whether each text element meets AA and/or AAA requirements and, if not, suggest colour adjustments to achieve compliance.

## Supported Nodes and Colour Extraction

To evaluate contrast, the plugin needs to examine text layers and their background fills. Relevant aspects of the Figma Plugin API:

- **TextNode fills:** Each text node can have one or more sets of fills, specifying colours for the characters. The `fills` property returns an array of `Paint` objects; if characters have mixed colours, it returns `figma.mixed` ([fills | Developer Docs](https://developers.figma.com/docs/plugins/api/properties/nodes-fills/#:~:text=fills%20,Remarks)). Solid colours can be created using `solidPaint` with CSS colour strings.
- **Text node properties:** Text nodes expose properties such as `characters`, `fontSize`, `fontName`, and `fills` ([TextNode | Developer Docs](https://developers.figma.com/docs/plugins/api/TextNode/#:~:text=TextNode%20,TextNode)). The plugin must load fonts via `loadFontAsync` before reading or modifying text content.
- **Background fills:** Page nodes have a `backgrounds` property instead of `fills` ([fills | Developer Docs](https://developers.figma.com/docs/plugins/api/properties/nodes-fills/#:~:text=fills%20,Remarks)). For other shapes, the plugin should inspect the nearest rectangle or shape layer behind the text to approximate the visual background colour. If multiple overlapping fills exist, the plugin may need to compute a composite colour.
- **Node traversal:** The plugin will traverse the selected nodes (or the entire file if needed) to locate text nodes. It should recursively explore children of frame-like nodes (FrameNode, GroupNode) to find `TextNode` items. This can be performed using `findAll` or custom traversal functions.
- **Supported node types:** The plugin will focus on `TextNode` elements for contrast checks. Other node types (e.g. `ShapeNode`, `FrameNode`, `PageNode`) will be considered only to derive background colours or bounding rectangles. Components, instances and variable-bound nodes can be supported as long as the underlying `TextNode` and fill information can be extracted.

## Plugin Limits and Figma API Constraints

Several Figma plugin API limitations and environment constraints influence the design:

1. **Access to styles and components:** The plugin can only access styles, components and instances that are present in the file or imported into it. It cannot fetch styles from external libraries unless they have been imported via `importComponentByKeyAsync()` ([Introduction | Developer Docs](https://developers.figma.com/docs/plugins/#:~:text=,viewed%20page)).
2. **Font loading:** Fonts must be explicitly loaded using `loadFontAsync()` before reading or editing text nodes. The plugin cannot access fonts that are not available in the editor’s font list ([Introduction | Developer Docs](https://developers.figma.com/docs/plugins/#:~:text=,file%20via%20Figma%27s%20REST%20API)).
3. **Data storage limits:** Figma enforces a limit of **100 kB per entry** for `setSharedPluginData` or `setPluginData` calls ([setPluginData 100kb size limit now being enforced](https://forum.figma.com/report-a-problem-6/setplugindata-100kb-size-limit-now-being-enforced-38987#:~:text=setPluginData%20100kb%20size%20limit%20now,wasn%27t%20actively%20enforced%20until%20recently)). The plugin should avoid storing large amounts of data in the document and instead compute results on the fly or use remote storage if needed.
4. **Network access restrictions:** Plugins can only fetch resources from domains explicitly allowed in the manifest. If network requests are necessary (e.g. for remote storage), the manifest must specify allowed domains; otherwise the requests will fail ([How Plugins Run | Developer Docs](https://developers.figma.com/docs/plugins/how-plugins-run/#:~:text=,rendering%20content%20from%20other%20domains)).
5. **Asynchronous file loading:** Figma files are loaded lazily, so not all pages and nodes are immediately available. The plugin should use asynchronous API methods to load additional pages as required ([Introduction | Developer Docs](https://developers.figma.com/docs/plugins/#:~:text=,viewed%20page)).
6. **API rate limits and plan restrictions:** Some Figma plans (e.g. viewer/collaborator seats) may restrict the number of API calls per month. While this primarily affects REST API usage and not plugin runtime, the plugin should minimize external API calls and rely on on-board computation.

## Scope and Assumptions

- **Core functionality:** The plugin will scan selected layers (or the entire Figma document) to locate text nodes, compute contrast ratios between text colour and background colour, and determine compliance with WCAG Level AA and AAA. It will produce a report listing text layers that fail to meet thresholds and provide suggestions for adjusting colours to achieve compliance.
- **UI and workflow:** The plugin will offer an interface where users can start a scan, review results, and click to apply suggested colour changes. However, building the UI is beyond Phase 0 and will be addressed in later phases.
- **Automation goals:** Atlas and Codex agents will automate research, coding, testing, and packaging. Phase 0 focuses on drafting these assumptions, creating a repository with CI scaffolding, and preparing the environment for further development.
- **Limitations:** The plugin will not support checking non-text elements (graphics) for contrast at Level AA; this may be considered in later enhancements. Large amounts of plugin data will not be stored inside the Figma file to avoid hitting the 100 kB storage limit.
