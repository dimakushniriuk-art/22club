import Link from 'next/link'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from '@/components/ui'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-16">
        <div className="space-y-8 text-center">
          <h1 className="text-text-primary text-4xl font-bold tracking-tight sm:text-6xl">
            <span className="text-gradient">22Club</span> Setup
          </h1>
          <p className="text-text-secondary mx-auto max-w-2xl text-xl">
            Benvenuto nel setup del progetto 22Club. Un&apos;applicazione Next.js 15 con TypeScript,
            Tailwind CSS e Supabase.
          </p>

          <Card variant="elevated" className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle size="lg">Configurazione Completata</CardTitle>
              <CardDescription>
                Il progetto è stato configurato con tutte le tecnologie richieste
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-primary">Next.js 15 con App Router</span>
                  <Badge variant="success" size="sm">
                    ✓
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-primary">TypeScript strict mode</span>
                  <Badge variant="success" size="sm">
                    ✓
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-primary">Tailwind CSS con dark mode</span>
                  <Badge variant="success" size="sm">
                    ✓
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-primary">ESLint + Prettier</span>
                  <Badge variant="success" size="sm">
                    ✓
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-primary">Supabase client SDK</span>
                  <Badge variant="success" size="sm">
                    ✓
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <Button asChild className="w-full" variant="primary" size="lg">
                  <Link href="/login">Vai al Login</Link>
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button asChild variant="secondary" size="md">
                    <Link href="/dashboard">Demo Staff</Link>
                  </Button>
                  <Button asChild variant="outline" size="md">
                    <Link href="/home">Demo Atleta</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
