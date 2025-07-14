export const checkIfOpen = (placeDetails) => {
    if (!placeDetails?.opening_hours?.periods) {
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
    const localHours = localTime.getHours();
    const localMinutes = localTime.getMinutes();
    const currentTimeInMinutes = localHours * 60 + localMinutes;

    const todaysHours = placeDetails.opening_hours.periods.find(p => p.open.day === localDay);

    if (todaysHours?.close) {
        const openTime = parseInt(todaysHours.open.time, 10);
        const openTimeInMinutes = Math.floor(openTime / 100) * 60 + (openTime % 100);
        const closeTime = parseInt(todaysHours.close.time, 10);
        const closeHours = Math.floor(closeTime / 100);
        const closeMinutes = closeTime % 100;
        let closeTimeInMinutes = closeHours * 60 + closeMinutes;

        if (closeTimeInMinutes < openTimeInMinutes) closeTimeInMinutes += 24 * 60;

        if (currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes) {
            const minutesUntilClose = closeTimeInMinutes - currentTimeInMinutes;
            const isClosingSoon = minutesUntilClose > 0 && minutesUntilClose <= 120;

            return {
                statusText: "Отворено",
                detailText: `Ще затвори в ${closeHours.toString().padStart(2, '0')}:${closeMinutes.toString().padStart(2, '0')}`,
                color: isClosingSoon ? "text-yellow-500" : "text-green-600",
                isOpen: true,
                isClosingSoon: isClosingSoon,
            };
        }
    }

    const dayNames = ['неделя', 'понеделник', 'вторник', 'сряда', 'четвъртък', 'петък', 'събота'];

    const sortedPeriods = [...placeDetails.opening_hours.periods].sort((a, b) => {
        if (a.open.day !== b.open.day) return a.open.day - b.open.day;
        return parseInt(a.open.time, 10) - parseInt(b.open.time, 10);
    });

    let nextOpeningPeriod = sortedPeriods.find(p => {
        const openTimeInMinutes = Math.floor(parseInt(p.open.time, 10) / 100) * 60 + (parseInt(p.open.time, 10) % 100);
        return p.open.day === localDay && openTimeInMinutes > currentTimeInMinutes;
    });

    if (!nextOpeningPeriod) {
        for (let i = 1; i <= 7; i++) {
            const nextDayIndex = (localDay + i) % 7;
            const firstPeriodOfDay = sortedPeriods.find(p => p.open.day === nextDayIndex);
            if (firstPeriodOfDay) {
                nextOpeningPeriod = firstPeriodOfDay;
                break;
            }
        }
    }

    if (nextOpeningPeriod) {
        const day = dayNames[nextOpeningPeriod.open.day];
        const time = nextOpeningPeriod.open.time;
        const formattedTime = `${time.slice(0, 2)}:${time.slice(2)}`;

        return { 
            statusText: "Затворено",
            detailText: `Отваря ${day} в ${formattedTime}`,
            color: "text-red-500",
            isOpen: false,
            isClosingSoon: false
        };
    }

    return { 
        statusText: "Затворено", 
        detailText: "", 
        color: "text-red-500", 
        isOpen: false,
        isClosingSoon: false
    };
};