import { useNavigate } from "react-router";
import { Button } from "./ui/button";

export const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate(-1)}
      className="p-4 mr-4 text-left" // Align the button to the left
    >
      <span className="md:inline hidden">← Back</span>
      <span className="md:hidden">←</span>
    </Button>
  );
};
