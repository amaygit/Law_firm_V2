// // backend/middleware/auth-middleware.js
// import jwt from "jsonwebtoken";
// import User from "../models/user.js";
// const authMiddleware = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     // console.log(token);
//     if (!token) {
//       return res.status(401).json({
//         message: "Unauthorized",
//       });
//     }
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.userId);
//     if (!user) {
//       return res.status(401).json({
//         message: "Unauthorized",
//       });
//     }
//     // console.log(user);
//     req.user = user;
//     next();
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       message: "Internal Server Error",
//     });
//   }
// };

// export default authMiddleware;
// backend/middleware/auth-middleware.js
// import jwt from "jsonwebtoken";
// import User from "../models/user.js";

// const authMiddleware = async (req, res, next) => {
//   try {
//     // ✅ Detailed logging
//     console.log("🔐 Auth middleware:", {
//       method: req.method,
//       path: req.path,
//       hasAuthHeader: !!req.headers.authorization,
//       authHeaderPreview: req.headers.authorization?.substring(0, 30),
//     });

//     const token = req.headers.authorization?.split(" ")[1];

//     if (!token) {
//       console.log("❌ No token found in Authorization header");
//       return res.status(401).json({
//         success: false,
//         message: "Authentication required - No token provided",
//       });
//     }

//     console.log("🔑 Token found:", token.substring(0, 20) + "...");
//     console.log("🔒 JWT_SECRET exists:", !!process.env.JWT_SECRET);

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log("✅ Token decoded, userId:", decoded.userId);

//     const user = await User.findById(decoded.userId);

//     if (!user) {
//       console.log("❌ User not found:", decoded.userId);
//       return res.status(401).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     console.log("✅ User authenticated:", user.email);

//     req.user = user;
//     next();
//   } catch (error) {
//     console.error("❌ Auth middleware error:", error.message);
//     if (error.name === "JsonWebTokenError") {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid token",
//       });
//     }
//     if (error.name === "TokenExpiredError") {
//       return res.status(401).json({
//         success: false,
//         message: "Token expired",
//       });
//     }
//     res.status(500).json({
//       success: false,
//       message: "Authentication error",
//     });
//   }
// };

// export default authMiddleware;
// backend/middleware/auth-middleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check if header exists and starts with Bearer
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Only log this in development to debug connection issues
      if (process.env.NODE_ENV === "development") {
        console.log("❌ Auth failed: No Bearer token provided");
      }
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find User (Excluding password)
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or account deactivated",
      });
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({
          success: false,
          message: "Session expired. Please log in again.",
        });
    }

    console.error("❌ Auth middleware error:", error.message);
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error during authentication",
      });
  }
};

export default authMiddleware;
