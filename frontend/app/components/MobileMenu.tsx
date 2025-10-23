import type { MenuItem } from "@/types";
import React from "react";
import { Button } from "./ui/button";
import { Link } from "react-router";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Separator } from "./ui/separator";
import { ChevronsUpDown } from "lucide-react";

type MobileMenuProps = {
  navMenu: MenuItem[];
};

const MobileMenu = ({ navMenu }: MobileMenuProps) => {
  return (
    <div>
      <ul className="mb-3">
        {navMenu.map(({ href, label, submenu }, index) => (
          <li key={index}>
            {submenu ? (
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between">
                    {label}
                    <ChevronsUpDown />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="ps-2">
                  <ul className="border-l border-l-muted-foreground/20">
                    {submenu.map(({ href, label }, index) => (
                      <li key={index}>
                        <Button asChild variant="ghost" className="w-full justify-start text-muted-foreground hover:bg-transparent">
                          <a href={href}>{label}</a>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <Button asChild variant="ghost" className="w-full justify-start">
                <a href={href}>{label}</a>
              </Button>
            )}
          </li>
        ))}
      </ul>
      <Separator className="bg-muted-foreground/20"/>
      <div className="flex gap-3 mt-4">
         <Link to="/sign-in">
  <Button
    variant="ghost"
    className="flex-1"
  >
    
    Sign In
  </Button>
  </Link>
  <Link to="/sign-up">
    <Button
    className="flex-1 bg-purple-700 hover:bg-purple-600 focus:bg-purple-600 text-white font-semibold"
  >
    Free Trial
  </Button>
  </Link>
</div>
    </div>
  );
};

export default MobileMenu;
