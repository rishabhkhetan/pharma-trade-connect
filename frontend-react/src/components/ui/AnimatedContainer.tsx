import { ReactNode } from "react";

type AnimatedContainerProps = {
  children: ReactNode;
};

export default function AnimatedContainer({ children }: AnimatedContainerProps) {
  return (
    <div
      className="animate-fade-in min-h-screen"
      style={{
        animation: "fadeIn 0.4s ease-in-out",
      }}
    >
      {children}

      {/* Animation CSS */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(4px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}
