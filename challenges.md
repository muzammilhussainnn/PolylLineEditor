# Phase 4: Challenges and Confusions

During the implementation of the PolyLine Editor, several technical and logical hurdles were addressed to meet the requirements set in Phase 1.

### 1. The "Closest Point" Logic
The primary challenge was implementing the **Euclidean Distance Formula** efficiently.
$$d = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$
We had to determine a "sensitivity radius" (set to 15 pixels). If the radius was too small, the user couldn't "grab" the vertex; if too large, they would accidentally edit the wrong line.

### 2. Keyboard Interrupt Conflict
Since the system relies on keys like `b`, `m`, and `d`, a major confusion was ensuring that pressing a key while already in a mode didn't crash the array index. I implemented a **State Machine** in the code to handle these transitions safely.

### 3. Visual Feedback
A significant "confusion" during testing was that users didn't know which point they were about to delete or move. To solve this, I added a visual "highlight" (dashed lines or coordinate tracking) so the user sees the system’s intent before committing to an action.
