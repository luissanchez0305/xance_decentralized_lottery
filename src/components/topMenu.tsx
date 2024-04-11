'use client'
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export default function TopMenu() {
    const [collapsed, setSidebarCollapsed] = useState(false);
    return (
        <div className="bg-indigo-700 text-white">
        <button onClick={() => setSidebarCollapsed((prev) => !prev)}>
          <Bars3Icon className="w-10 h-10" />
        </button>
      </div>
    )
}