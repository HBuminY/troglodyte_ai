import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { prisma } from "@/lib/prisma";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";

export async function AuthButton() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dbUser = user 
    ? await prisma.user.findUnique({
        where: { id: user.id },
      })
    : null;

  return user ? (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {user.email}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-content" align="start">
          <DropdownMenuItem asChild>
            <Link href="/profile/dashboard">Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile/settings">Settings</Link>
          </DropdownMenuItem>
          {dbUser && dbUser.role === "ADMIN" && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/profile/add-datacenter">Add Datacenter</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile/add-greenhouse">Add Greenhouse</Link>
            </DropdownMenuItem>
          </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
