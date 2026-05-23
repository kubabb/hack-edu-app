import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function CopyrightPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col min-h-[80vh] bg-[#f6f4ef] pt-32 pb-20 px-4">
        <div className="mx-auto max-w-4xl cartoon-panel rounded-[32px] p-8 md:p-12 w-full text-[#315083]">
          <h1 className="font-display text-4xl text-[#06296b] mb-8">Prawa autorskie</h1>
          
          <div className="space-y-8 text-lg font-bold">
            <div className="rounded-2xl bg-[#fff4cf] border border-[#f6dec0] p-6 text-[#06296b]">
              <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2">
                <span className="text-2xl">⚠️</span> UWAGA: Prawo autorskie
              </h2>
              <p className="mb-2">Wgrywając plik, oświadczasz, że:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Posiadasz prawa do materiału LUB</li>
                <li>Korzystasz z dozwolonego użytku edukacyjnego LUB</li>
                <li>Materiał jest dostępny na licencji otwartej (np. CC)</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-[#fff0ef] border border-[#ffd3cf] p-6 text-[#d8342b]">
              <h3 className="text-xl font-extrabold mb-4 flex items-center gap-2">
                <span className="text-2xl">❌</span> NIE wgrywaj:
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Pełnych e-booków, podręczników, książek</li>
                <li>Materiałów chronionych bez zgody autora</li>
                <li>Skanów rozdziałów z publikacji komercyjnych</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white border border-[#dce7f5] p-6">
              <h3 className="text-xl font-extrabold mb-4 flex items-center gap-2 text-[#06296b]">
                <span className="text-2xl">⚖️</span> Odpowiedzialność
              </h3>
              <p className="leading-8 text-[#6e7fa6]">
                Ponosisz pełną odpowiedzialność prawną za naruszenie 
                praw autorskich. Platforma usunie materiały naruszające prawo
                i może zablokować Twoje konto.
              </p>
            </div>
            
            <div className="mt-8 border-t border-[#dce7f5] pt-8">
              <h3 className="text-xl font-extrabold text-[#06296b] mb-4">Mniejsze noty do wykorzystania w aplikacji:</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-white p-5 rounded-2xl border border-[#dce7f5]">
                  <h4 className="font-extrabold text-sm text-[#a5b1ca] uppercase tracking-wider mb-2">Wersja krótka</h4>
                  <p className="text-sm">⚠️ Tylko legalne materiały. Wgrywając plik potwierdzasz, że posiadasz prawa LUB korzystasz z dozwolonego użytku. ❌ Zakaz wgrywania: Pełnych e-booków i materiałów bez zgody autora. ⚖️ Ponosisz odpowiedzialność za naruszenia. Możemy usunąć materiały i zablokować konto.</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-[#dce7f5]">
                  <h4 className="font-extrabold text-sm text-[#a5b1ca] uppercase tracking-wider mb-2">Wersja mini</h4>
                  <p className="text-sm">⚠️ UWAGA: Prawo autorskie. Wgrywając plik oświadczasz, że posiadasz do niego prawa lub korzystasz z dozwolonego użytku edukacyjnego. NIE wgrywaj pełnych e-booków. Ponosisz pełną odpowiedzialność za naruszenie praw autorskich.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
