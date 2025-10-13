<!-- for what it's worth i find this artifact pretty unhelpful -->
flowchart TD
    subgraph Frontend [Frontend - React + TypeScript + Konva]
        A[App.tsx] --> B[Canvas.tsx]
        A --> C[Toolbar.tsx]
        A --> D[AvatarBar.tsx]
        B --> E[Konva Stage & Layers]
        B --> F[Shape Rendering]
        F --> G[Rectangle Shapes]
        A --> H[AuthForm.tsx]
        subgraph Stores [Zustand Stores]
            I[useUserStore] 
            J[useCursorStore]
            K[useShapeStore]
        end
        B --> I
        B --> J
        B --> K
        C --> K
        D --> I
        D --> J
    end

    subgraph Backend [Firebase]
        L[Firebase Auth]
        M[Firestore - Persistent Shapes]
        N[Realtime DB - Cursors & Presence]
        O[Firebase Hosting]
    end

    subgraph LocalStorage [Browser Storage]
        P[localStorage - shape state]
    end

    %% Connections
    H -- login/logout --> L
    I -- auth state --> L
    I -- online status --> N
    J -- cursor updates --> N
    K -- shape CRUD --> M
    K -- load/save fallback --> P
    B -- renders shapes --> K
    B -- renders cursors --> J
    D -- reads presence --> I
    O -- hosts --> App.tsx
