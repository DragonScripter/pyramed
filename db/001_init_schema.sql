-- Create the Patients Table
CREATE TABLE public.patients (
    patient_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    age INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Admitted',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create the Vitals Table
CREATE TABLE public.vitals (
    vital_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES public.patients(patient_id) ON DELETE CASCADE,
    heart_rate INT NOT NULL,
    spo2 INT NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Turn on Realtime so UI updates instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.vitals;
