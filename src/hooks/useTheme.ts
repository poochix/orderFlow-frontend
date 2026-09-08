import { useEffect, useState } from "react"

 type Theme = "light" | "dark"

export const useTheme = ()=>{
    const [theme , setTheme] = useState<Theme>(()=>{
        return (localStorage.getItem("theme") as Theme) ?? 'light' ;
    })

    useEffect(()=>{
        const root = document.documentElement;

        if(theme === 'dark'){
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }

        localStorage.setItem("theme", theme);

    },[theme])

    const toggleTheme = ()=>{
        setTheme((current)=> current==='light' ? 'dark' : 'light');
    }
     
    return {
        theme,
        toggleTheme
    }
}