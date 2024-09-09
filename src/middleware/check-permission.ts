import { NextFunction, Request, Response } from "express";
import { Role } from "../models/roleModel";

interface CustomRequest extends Request {
  user?: {
    role: string;
  };
}

function checkPermission(requiredPermission: string) {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    const role = await Role.findById(userRole);

    if (!role) {
      return res.status(403).json({ message: "Role not found." });
    }

    if (role.permissions.includes(requiredPermission)) {
      next();
    } else {
      res.status(403).json({ message: "Action is forbidden." });
    }
  };
}

export default checkPermission;
