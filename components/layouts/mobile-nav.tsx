import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { NavItem } from '@/types/navbar'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Icons } from '@/components/icons'

interface MobileNavProps {
  items?: NavItem[]
}

export function MobileNav({ items }: MobileNavProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
        >
          <Icons.menu className="size-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="inset-y-0 flex h-auto w-[300px] flex-col p-0"
      >
        <div className="px-7 py-6">
          <Link
            aria-label="Home"
            href="/"
            className="flex w-fit items-baseline space-x-2"
            onClick={() => setIsOpen(false)}
          >
            <Icons.reelLogo className="h-7 w-7" />
            <span className="inline-block text-2xl font-bold text-secondary-foreground">
              {siteConfig.name}
            </span>
          </Link>
        </div>
        <div className="my-4 flex flex-1 flex-col gap-4 px-9 pb-2">
          {items?.map((item, index) => (
            <div className="border-b last:border-b-0" key={item.title}>
              <MobileLink
                key={index}
                href={item.href!}
                pathname={pathname}
                setIsOpen={setIsOpen}
                disabled={item.disabled}
                scroll={item.scroll}
              >
                {item.title}
              </MobileLink>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface MobileLinkProps {
  children?: React.ReactNode
  href: string
  disabled?: boolean
  pathname: string
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  scroll?: boolean
}

function MobileLink({
  children,
  href,
  disabled,
  pathname,
  setIsOpen,
  scroll,
}: MobileLinkProps) {
  return (
    <Link
      href={href}
      scroll={scroll}
      className={cn(
        'w-fit text-base font-medium text-foreground/70 transition-colors hover:text-foreground py-2 block',
        pathname === href && 'text-foreground font-bold',
        disabled && 'pointer-events-none opacity-60'
      )}
      onClick={() => setIsOpen(false)}
    >
      {children}
    </Link>
  )
}
