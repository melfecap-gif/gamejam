# Contributing to StreetWise 🚦

We welcome community contributions! This project is designed to be a modular platform for "Traffic Lessons".

## 🛠️ Adding a New Lesson
A "Lesson" is a combination of:
1.  **A Trigger**: A zone in the world where the lesson happens.
2.  **A Check**: The logic to verify if the player followed the rule.
3.  **A Dialog**: Providing the educational feedback.

### 🔌 How to add a Lesson
1.  **Add a Trigger** in `main.js`:
    ```js
    this.triggerSystem.addTrigger('your_lesson_name', pos, radius, () => {
        // Your logic here
    });
    ```
2.  **Add Translations** in `locales/` for both `en.json` and `pt.json`:
    ```json
    "lessons": {
        "your_lesson_name": "Always check your blind spots!"
    }
    ```
3.  **Update Chapter Logic** in `main.js`'s `startChapter` method if you want to create a new narrative step.

## 🏗️ Project Structure
- `index.html`: Entry point & UI Layer.
- `style.css`: Visual styling & Glassmorphism.
- `main.js`: Game Loop, Initialization, and State Management.
- `world.js`: Procedural or Static world building.
- `player.js`: All controller logic for Dash (Car) and Step (Human).
- `trigger.js`: Interaction system.
- `i18n.js`: Localization support.

### 🎨 Visuals
If you are adding models, please stick to the **Friendly Low-Poly** aesthetic.
- Use rounded BoxGeometry for buildings.
- Use vibrant, soft color palettes (HSL).
- Avoid realistic textures; prefer solid colors with nice lighting.

Join us in making the roads safer! 🚦📱
