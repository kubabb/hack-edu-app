import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col min-h-[80vh] bg-[#f6f4ef] pt-32 pb-20 px-4">
        <div className="mx-auto max-w-4xl cartoon-panel rounded-[32px] p-8 md:p-12 w-full text-[#315083]">
          <h1 className="font-display text-4xl text-[#06296b] mb-8">Regulamin platformy</h1>
          
          <div className="space-y-6 text-base font-bold leading-8 text-[#6e7fa6]">
            <p>
              Korzystając z naszej platformy, akceptujesz poniższe warunki świadczenia usług.
            </p>
            <h2 className="text-2xl font-extrabold text-[#06296b] mt-8 mb-4">1. Postanowienia ogólne</h2>
            <p>
              TutorAI to platforma edukacyjna wykorzystująca sztuczną inteligencję do wspierania 
              procesu nauki. Usługa jest przeznaczona dla uczniów, studentów i nauczycieli.
            </p>
            
            <h2 className="text-2xl font-extrabold text-[#06296b] mt-8 mb-4">2. Treści użytkownika i Prawa autorskie</h2>
            <p>
              Użytkownik ponosi pełną odpowiedzialność za wgrywane materiały. 
              Zabrania się wgrywania pełnych podręczników i materiałów chronionych bez zgody autora. 
              Szczegóły znajdują się w sekcji <Link href="/prawne/prawa-autorskie" className="text-[#7057ff] underline">Prawa Autorskie</Link>.
            </p>

            <h2 className="text-2xl font-extrabold text-[#06296b] mt-8 mb-4">3. Płatności i Subskrypcje</h2>
            <p>
              Niektóre funkcje (np. przedłużone rozmowy z LiveAvatar) mogą wymagać aktywnej subskrypcji. 
              Możesz zrezygnować z płatnego planu w każdej chwili.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
