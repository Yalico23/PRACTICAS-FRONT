import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";

const region = import.meta.env.VITE_AWS_REGION;
const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;

if (!region || !accessKeyId || !secretAccessKey) {
    console.log(region, accessKeyId, secretAccessKey);
    throw new Error("AWS credentials or region are not defined in environment variables.");
}

const pollyClient = new PollyClient({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

export const speakWithPolly = async (text: string): Promise<HTMLAudioElement | null> => {
    try {
        const command = new SynthesizeSpeechCommand({
            OutputFormat: "mp3",
            Text: text,
            VoiceId: import.meta.env.VITE_AWS_VOICE_NAME,
        });

        const response = await pollyClient.send(command);

        if (!response.AudioStream) {
            throw new Error("No se recibió AudioStream de Polly.");
        }
        
        const audioBuffer = await response.AudioStream.transformToByteArray();
        const uint8Array = new Uint8Array(audioBuffer as unknown as ArrayBuffer);
        const audioBlob = new Blob([uint8Array], { type: "audio/mpeg" });
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);
        return audio;
    } catch (err) {
        console.error("Error al usar Polly:", err);
        return null;
    }
};