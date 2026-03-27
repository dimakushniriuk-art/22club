const fs = require('fs')
const path = require('path')
const p = path.join(__dirname, '../src/app/home/allenamenti/riepilogo/page.tsx')
let s = fs.readFileSync(p, 'utf8')

s = s.replace(
  /<div className="min-h-0 flex-1 overflow-auto px-3 pb-24 safe-area-inset-bottom sm:px-4 min-\[834px\]:px-6 flex items-center justify-center">\s*<Card className="relative overflow-hidden border-red-500\/30 bg-background-secondary\/50 max-w-md w-full">\s*<CardContent[^>]+>\s*<div className="mb-3 text-4xl opacity-50">[^<]+<\/div>/m,
  `<div className="min-h-0 flex-1 overflow-auto px-3 pb-28 safe-area-inset-bottom sm:px-4 min-[834px]:px-6 min-[834px]:pb-24 flex items-center justify-center">
          <Card className="relative max-w-md w-full overflow-hidden rounded-2xl border-red-500/30 bg-background-secondary/50">
            <CardContent className="p-6 min-[834px]:p-8 text-center relative z-10">
              <div className="mb-3 flex justify-center opacity-50" aria-hidden>
                <Lock className="h-10 w-10 text-text-tertiary" />
              </div>`,
)

s = s.replace(
  /onClick=\{\(\) => router\.push\('\/login'\)\}\s*className="min-h-\[44px\] h-9 rounded-lg bg-primary/,
  `onClick={() => router.push('/login')}
                className="min-h-[44px] h-9 touch-manipulation rounded-xl bg-primary`,
)

s = s.replace(
  /<Card className="border border-state-error\/50 bg-background-secondary\/50">\s*<CardContent[^>]+>\s*<div className="mb-3 text-4xl opacity-50">[^<]+<\/div>/m,
  `<Card className="relative overflow-hidden rounded-2xl border border-state-error/50 bg-background-secondary/50">
            <CardContent className="p-6 min-[834px]:p-8 text-center relative z-10">
              <div className="mb-3 flex justify-center opacity-50" aria-hidden>
                <X className="h-10 w-10 text-state-error" />
              </div>`,
)

s = s.replace(
  /onClick=\{\(\) => router\.push\('\/home\/allenamenti'\)\}\s*className="min-h-\[44px\] h-9 rounded-lg bg-primary text-sm font-medium/,
  `onClick={() => router.push('/home/allenamenti')}
                className="min-h-[44px] h-9 touch-manipulation rounded-xl bg-primary text-sm font-medium`,
)

fs.writeFileSync(p, s, 'utf8')
console.log('patched')
