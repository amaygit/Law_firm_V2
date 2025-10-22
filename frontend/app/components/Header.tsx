import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Menu } from "lucide-react";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import "@/app.css";
import { navMenu } from "@/constants";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu";
import { Link } from "react-router";

const Header = () => {
  return (
    <header className="h-16 grid grid-cols-1 items-center md:h-20 lg:h-24">
      <div className="container flex justify-between items-start py-0">
        <Logo variant="icon" />

        <NavigationMenu className="max-lg:hidden mx-auto ">
          <NavigationMenuList>
            {navMenu.map(({ href, label, submenu }, index) => (
              <NavigationMenuItem key={index}>
                {submenu ? (
                  <>
                    <NavigationMenuTrigger className="menu-trigger">
                      {label}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="menu-content">
                      <ul className="grid grid-cols-2 gap-2 p-4 min-w-[500px]">
                        {submenu.map(({ href, icon, label, desc }, index) => (
                          <li key={index}>
                            <NavigationMenuLink asChild>
                              <a href={href} className="">
                                <div className="w-10 h-10 flex-shrink-0 grid place-items-center">
                                  {icon}
                                </div>
                                <div>
                                  <div className="text-[13px] leading-normal mb-1">
                                    {label}
                                  </div>
                                  <p className="text-[13px] leading-normal text-muted-foreground">
                                    {desc}
                                  </p>
                                </div>
                              </a>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink
                    href={href}
                    className={`${navigationMenuTriggerStyle()} menu-link`}
                  >
                    {label}
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center g-2 justify-end max-lg:hidden">
          <Link to="/sign-in">
            <Button variant="ghost">Sign In</Button>
          </Link>

          <Link to="/sign-up">
            <Button className="bg-purple-700 hover:bg-purple-600 focus:bg-purple-600 text-white font-semibold ml-2">
              Free Trial
            </Button>
          </Link>
        </div>
        <div className="flex flex-row-reverse items-center space-x-0 space-x-reverse">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                style={{
                  background: "#000",
                  color: "#fff",
                  borderRadius: "0.75rem",
                  transition: "background 0.2s, color 0.2s",
                  marginLeft: "0.75rem",
                }}
              >
                <Menu />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              sideOffset={8}
              className="p-0 border-0 shadow-lg bg-background/50 
              backdrop-blur-3xl border-foreground/5 border-x-0 border-b-0
              overflow-hidden"
              style={{
                background: "#000",
                color: "#fff",
                borderRadius: "1rem",
                minWidth: "200px",
              }}
            >
              <MobileMenu navMenu={navMenu} />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
};

export default Header;
