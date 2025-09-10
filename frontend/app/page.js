"use client"
import { Button } from "@/components/ui/button";

export default function Home() {
  async function getDjangoAPIData() {
    const response = await fetch("http://127.0.0.1:8000/api/hello");
    const data = await response.json();
    console.log(data);
  }

  async function handleClick() {
    await getDjangoAPIData();
  }

  return (
    <div>
      <p>Hii Guys!!</p>
      <Button variant="destructive" onClick={handleClick}>Look Up</Button>
      <button onClick={handleClick}>Say Hello</button>
    </div>
  );
}
