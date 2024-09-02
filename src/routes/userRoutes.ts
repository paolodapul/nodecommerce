import express, { Request, Response } from "express";

const router = express.Router();

type User = {
  username: string;
  password: string;
};

function register(req: Request<object, object, User>, res: Response) {
  try {
    const { username, password } = req.body;
    console.log("username", username);
    console.log("password", password);
    res.status(200).json({ message: "Hello" });
  } catch (error: unknown) {
    res
      .status(500)
      .json({ error: "Registration failed", msg: (error as Error).message });
  }
}

router.post("/register", register);
router.get("/test", function (req, res) {
  res.send("test!");
});

export default router;
