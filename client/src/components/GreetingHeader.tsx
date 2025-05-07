import { useEffect, useState } from "react";

export default function GreetingHeader() {
  const [greeting, setGreeting] = useState<string>("Olá");
  const username = "Expositor"; // Poderia vir de um contexto de autenticação

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Bom dia");
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Boa tarde");
    } else {
      setGreeting("Boa noite");
    }
  }, []);

  return (
    <div className="mb-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-medium text-gray-400">{greeting},</h2>
        <h1 className="text-4xl sm:text-5xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
          {username}
        </h1>
      </div>
      <p className="mt-4 text-gray-400 max-w-xl">
        Bem-vindo à Central de Recursos para Expositores. Aqui você encontrará tudo o que precisa para ter sucesso no evento.
      </p>
    </div>
  );
}