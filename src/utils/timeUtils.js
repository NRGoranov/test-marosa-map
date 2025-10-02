export const checkIfOpen = (location) => {
    if (!location?.openingHours?.periods) {
        return { 
            statusText: "Няма информация",
            detailText: "",
            color: "text-gray-500", 
            isOpen: false, 
            isClosingSoon: false,
        };
    }

    const now = new Date();
    const timeZone = "Europe/Sofia";
    const localTime = new Date(now.toLocaleString("en-US", { timeZone }));

    const localDay = localTime.getDay();
    const currentTimeInMinutes = localTime.getHours() * 60 + localTime.getMinutes();
    
    const todaysHours = location.openingHours.periods.find(p => p.open.day === localDay);

    if (todaysHours?.close) {
        const openTimeInMinutes = todaysHours.open.hour * 60 + todaysHours.open.minute;
        let closeTimeInMinutes = todaysHours.close.hour * 60 + todaysHours.close.minute;

        if (closeTimeInMinutes < openTimeInMinutes) {
            closeTimeInMinutes += 24 * 60;
        }

        if (currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes) {
            const minutesUntilClose = closeTimeInMinutes - currentTimeInMinutes;
            const isClosingSoon = minutesUntilClose > 0 && minutesUntilClose <= 120;
            const closeTimeFormatted = `${String(todaysHours.close.hour).padStart(2, '0')}:${String(todaysHours.close.minute).padStart(2, '0')}`;

            return {
                statusText: "Отворено",
                detailText: `Ще затвори в ${closeTimeFormatted}`,
                color: isClosingSoon ? "text-yellow-500" : "text-green-600",
                isOpen: true,
                isClosingSoon: isClosingSoon,
            };
        }
    }

    const dayNames = ['неделя', 'понеделник', 'вторник', 'сряда', 'четвъртък', 'петък', 'събота'];
    
    let nextOpeningPeriod = null;
    for (let i = 0; i < 7; i++) {
        const nextDayIndex = (localDay + i) % 7;
        const periodsForDay = location.openingHours.periods
            .filter(p => p.open.day === nextDayIndex)
            .sort((a, b) => (a.open.hour * 60 + a.open.minute) - (b.open.hour * 60 + b.open.minute));

        const nextPeriod = periodsForDay.find(p => {
            const openTimeInMinutes = p.open.hour * 60 + p.open.minute;
            return i === 0 ? openTimeInMinutes > currentTimeInMinutes : true;
        });

        if (nextPeriod) {
            nextOpeningPeriod = nextPeriod;
            break;
        }
    }

    if (nextOpeningPeriod) {
        const day = dayNames[nextOpeningPeriod.open.day];
        const formattedTime = `${String(nextOpeningPeriod.open.hour).padStart(2, '0')}:${String(nextOpeningPeriod.open.minute).padStart(2, '0')}`;
        
        return { 
            statusText: "Затворено",
            detailText: `Отваря ${day} в ${formattedTime}`,
            color: "text-red-500",
            isOpen: false,
            isClosingSoon: false,
        };
    }

    return { 
        statusText: "Затворено", 
        detailText: "", 
        color: "text-red-500", 
        isOpen: false,
        isClosingSoon: false,
    };
};