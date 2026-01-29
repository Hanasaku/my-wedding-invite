export interface CalendarEvent {
    title: string;
    description: string;
    location: string;
    startTime: string; // ISO 8601 format (e.g., 2024-12-31T12:00:00)
    endTime: string;   // ISO 8601 format
}

/**
 * 產生 Google Calendar 的 Web Intent URL
 */
export const generateGoogleCalendarUrl = (event: CalendarEvent): string => {
    const formatDate = (isoString: string) => isoString.replace(/[-:.]/g, '').slice(0, 15) + 'Z';

    // 注意：這裡假設傳入的已經是 UTC 時間，或者我們需要處理時區。
    // 為了簡化，建議傳入的時間字串包含時區資訊，或在此轉換。
    // 這裡簡單處理：直接移除符號變成 YYYYMMDDTHHMMSSZ 格式
    // 實務上最好使用 Date 物件轉 ISO

    const start = new Date(event.startTime);
    const end = new Date(event.endTime);

    const startStr = start.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
    const endStr = end.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title,
        dates: `${startStr}/${endStr}`,
        details: event.description,
        location: event.location,
    });

    return `https://www.google.com/calendar/render?${params.toString()}`;
};

/**
 * 產生並下載 .ics 檔案 (適用於 Apple Calendar, Outlook)
 */
export const downloadIcsFile = (event: CalendarEvent): void => {
    // ICS 檔案格式標準
    // 換行必須是 \r\n
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);

    const startStr = start.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
    const endStr = end.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
    const nowStr = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//My Wedding Invite//React App//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${nowStr}-${Math.random().toString(36).substring(2)}@wedding-mission.com`,
        `DTSTAMP:${nowStr}`,
        `DTSTART:${startStr}`,
        `DTEND:${endStr}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description}`,
        `LOCATION:${event.location}`,
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'wedding-mission.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};
