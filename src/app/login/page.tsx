export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const error = params.error

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-block mb-2">
            <span className="text-3xl font-bold text-[#1e3a5f]">Diploma</span>
            <span className="text-3xl font-bold text-[#38bdf8]"> Santé</span>
          </div>
          <p className="text-gray-400 text-sm">la prépa médecine</p>
          <h1 className="text-xl font-semibold text-gray-800 mt-4">Espace administrateur</h1>
          <p className="text-gray-400 text-sm mt-1">Connectez-vous pour gérer les documents</p>
        </div>

        <form action="/api/auth/login" method="POST" className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              defaultValue="shirel.benchetrit@diploma-sante.fr"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8] focus:border-transparent transition"
              placeholder="admin@diploma-sante.fr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#38bdf8] focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              Email ou mot de passe incorrect
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#1e3a5f] text-white py-3 rounded-xl font-semibold hover:bg-[#2d5a8e] transition"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  )
}
