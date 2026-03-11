-- Cria a tabela push_subscriptions
CREATE TABLE public.push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Configura a segurança (RLS - Row Level Security) para a tabela
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Permite que os usuários insiram suas próprias inscrições
CREATE POLICY "Users can insert their own push subscriptions" 
ON public.push_subscriptions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Permite que os usuários vejam suas próprias inscrições
CREATE POLICY "Users can view their own push subscriptions" 
ON public.push_subscriptions FOR SELECT 
USING (auth.uid() = user_id);

-- Permite que os usuários atualizem suas próprias inscrições
CREATE POLICY "Users can update their own push subscriptions" 
ON public.push_subscriptions FOR UPDATE 
USING (auth.uid() = user_id);

-- Permite que os usuários deletem suas próprias inscrições
CREATE POLICY "Users can delete their own push subscriptions" 
ON public.push_subscriptions FOR DELETE 
USING (auth.uid() = user_id);

-- Permite que o Service Role (Edge Function do backend) leia tudo
CREATE POLICY "Service Role can read all subscriptions" 
ON public.push_subscriptions FOR SELECT 
USING (auth.role() = 'service_role');

-- Permite que o Service Role (Edge Function do backend) delete inscrições inválidas
CREATE POLICY "Service Role can delete invalid subscriptions" 
ON public.push_subscriptions FOR DELETE 
USING (auth.role() = 'service_role');
