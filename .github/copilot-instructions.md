# Copilot Instructions for `test-game-2d`

This document provides essential guidelines for AI coding agents to be productive in the `test-game-2d` codebase. Follow these instructions to ensure consistency, maintainability, and adherence to project-specific conventions.

---

## 1. **Big Picture Architecture**

The project is a 2D fighting game built as a Single Page Application (SPA) with a clean architecture approach. The codebase is organized into four primary layers:

1. **Domain** (`src/domain/`):
   - Contains core business logic and entities like `Character.js` and `GameState.js`.
   - These classes are pure and independent of external dependencies.

2. **Application** (`src/application/`):
   - Manages use cases and orchestrates data flow between layers.
   - Key components include `GameManager.js`, `SceneManager.js`, and `InputManager.js`.

3. **Presentation** (`src/presentation/`):
   - Handles UI and rendering logic.
   - Includes scenes like `TitleScene.js`, `BattleScene.js`, and `CharacterSelectScene.js`.

4. **Infrastructure** (`src/infrastructure/`):
   - Implements external system interactions, such as API clients and asset loading.
   - Examples: `MockApiClient.js`, `AssetLoader.js`, and `AuthManager.js`.

---

## 2. **Developer Workflows**

### Build and Run
- The project uses `vite` for development.
- To start the development server:
  ```bash
  npx vite
  ```

### Mock API
- The `MockApiClient.js` simulates backend API calls using `mock-db.js`.
- To switch between mock and real API, toggle the `IS_DEV_MODE` variable in `main.js`.

### Debugging
- Use the `PerformanceMonitor.js` in `src/infrastructure/` to profile performance-critical sections.
- Debug hitboxes and animations by enabling `drawDebugRect()` in `CanvasRenderer.js`.

---

## 3. **Project-Specific Conventions**

### Clean Architecture Rules
- Follow strict dependency rules:
  - **Domain** depends on nothing.
  - **Application** depends only on **Domain**.
  - **Presentation** depends on **Application**.
  - **Infrastructure** depends on **Application** and **Domain**.

### Scene Management
- Scenes are managed by `SceneManager.js`.
- Each scene (e.g., `TitleScene.js`, `BattleScene.js`) must implement lifecycle methods like `init()`, `update()`, and `render()`.

### Input Handling
- Use `InputManager.js` to manage player inputs.
- Input buffering is implemented for precise move execution.

### Game State Serialization
- Use `GameState.serialize()` and `GameState.deserialize()` for saving and loading game states.

---

## 4. **Integration Points**

### External Libraries
- `animejs` is used for animations and is located in `src/assets/libs/anime.min.js`.

### Asset Management
- Assets (images, audio) are stored in `src/assets/`.
- Use `AssetLoader.js` to load assets safely. Missing assets should not crash the game.

### Mock API Endpoints
- Simulated endpoints include:
  - `GET /api/characters/playable`
  - `POST /api/auth/login`
  - `GET /api/stages`

---

## 5. **Examples of Patterns**

### Adding a New Scene
1. Create a new file in `src/presentation/scenes/` (e.g., `NewScene.js`).
2. Implement lifecycle methods (`init()`, `update()`, `render()`).
3. Register the scene in `SceneManager.js`.

### Extending a Character
1. Add a new base file in `src/characters_base/` (e.g., `NewCharacterBase.js`).
2. Define animations, frame data, and special moves.
3. Update `mock-db.js` to include the new character.

---

For questions or clarifications, consult the project maintainers or refer to the `README.md` file.
