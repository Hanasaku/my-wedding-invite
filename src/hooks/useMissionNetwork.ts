import { useState } from 'react';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyIw_gVH5-O7KXFbAaTA5t_XHLi4YwSoiusXr0qq__47KilzILOdbxH6o-VYWl2y8gm/exec';

export type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';
export type MailStatus = 'idle' | 'sending' | 'sent' | 'error';

interface RsvpPayload {
    action: 'rsvp';
    hash: string;
    client_uuid: string;
    agentName: string;
    alias: string;
    status: string;
    relation: string;
    adults: string;
    kids: string;
    veg: string;
}

interface MailPayload {
    email: string;
    guestName: string;
    status: string;
}

export const useMissionNetwork = () => {
    const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
    const [mailStatus, setMailStatus] = useState<MailStatus>('idle');

    const submitRSVP = async (payload: RsvpPayload): Promise<boolean> => {
        setSubmissionStatus('submitting');
        try {
            const params = new URLSearchParams();
            // Explicitly append keys to ensure type safety and order
            Object.entries(payload).forEach(([key, value]) => {
                params.append(key, value);
            });

            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString(),
            });

            const result = await response.json();

            if (result.status === 'success') {
                console.log("[PROTOCOL] Transmission Success.");
                setSubmissionStatus('success');
                return true;
            } else {
                throw new Error(result.message || "Unknown error");
            }
        } catch (error) {
            console.error("[CRITICAL] Transmission Failed:", error);
            setSubmissionStatus('idle'); // Reset to idle to allow retry, or 'error' if you prefer
            return false;
        }
    };

    const sendInviteMail = async (payload: MailPayload): Promise<boolean> => {
        setMailStatus('sending');
        try {
            const params = new URLSearchParams();
            params.append('action', 'send_mail');
            params.append('email', payload.email);
            params.append('guestName', payload.guestName);
            params.append('status', payload.status);

            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString(),
            });

            const result = await response.json();

            if (result.status === 'success') {
                setMailStatus('sent');
                return true;
            } else {
                throw new Error(result.message || 'Transmission Error');
            }
        } catch (error) {
            console.error("Mail Error:", error);
            setMailStatus('error');
            return false;
        }
    };

    const resetNetworkState = () => {
        setSubmissionStatus('idle');
        setMailStatus('idle');
    };

    const resetMailStatus = () => {
        setMailStatus('idle');
    };

    return {
        submissionStatus,
        mailStatus,
        submitRSVP,
        sendInviteMail,
        resetNetworkState,
        resetMailStatus,
        setSubmissionStatus // Expose for manual override if needed
    };
};
