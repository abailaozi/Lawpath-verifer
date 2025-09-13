import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET!;

export function signToken(username:string){
    return jwt.sign({username},JWT_SECRET,{expiresIn:'7d'});
}
export function verifyToken(token:string){
    try {
        return jwt.verify(token, JWT_SECRET) as { username: string };
      } catch {
        return null;
      }
}
