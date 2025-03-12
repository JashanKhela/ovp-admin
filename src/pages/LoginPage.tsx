import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/services/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner"
import Logo from "@/assets/logo.png"; // Use @ alias if configured


export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    const result = await login(username.toLowerCase(), password);
    setLoading(false);
  
    if (result.error) {
      toast(`Login Failed - ${result.error}`);
      return;
    }
  
    // Retrieve full user object from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
  
    // Redirect based on user role
    if (user.role === "admin") {
      navigate("/dashboard");
    } else if (user.role === "employee") {
      navigate("/dashboard/record-time");
    } else {
      navigate("/dashboard"); // Default fallback
    }
  
    toast.success(`Successfully logged in as ${username}`);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-[#a2dda7]">
      <Card className="w-96 shadow-lg">
        <CardHeader className="flex flex-col items-center">
          {/* Logo Placeholder */}
          <img src={Logo} alt="Okanagan Valley Produce" height={250} width={250} />
          <CardTitle className="text-center mt-2 text-lg font-semibold">
           Okanagan Valley Produce <br />Reporting Dashboard
          </CardTitle>
          <p className="text-sm text-gray-500">Please sign in to continue</p>
          <p className="text-sm text-gray-500"></p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600 cursor-pointer">
                Remember Me
              </label>
            </div>

            <Button onClick={handleLogin} className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </div>
        </CardContent><CardFooter className="text-center"> 
            <p>For any trouble logging in please contact <a href="mailto:jay@khelatech.com">jay@khelatech.com</a></p>
        </CardFooter>
      </Card>
    </div>
  );
}
