import React from 'react';
import styles from './ResponsiveShell.module.css';

/**
 * Mobile-first layout shell that provides consistent stacking order and
 * upgrades to a split view on larger screens.
 */
const ResponsiveShell = ({
    header,
    toolbar,
    map,
    panel,
    panelTitle,
    panelActions,
    floating,
}) => {
    return (
        <div className={styles.shell}>
            {header && <div className={styles.header}>{header}</div>}

            {toolbar && (
                <div className={styles.toolbar}>
                    {toolbar}
                </div>
            )}

            <div className={styles.content}>
                <section className={styles.mapSection} aria-label="Интерактивна карта">
                    {map}
                </section>

                <section className={styles.panelSection} aria-label="Списък с обекти">
                    <div className={styles.panelHeader}>
                        {panelTitle && <h2 className={styles.panelTitle}>{panelTitle}</h2>}
                        {panelActions}
                    </div>
                    {panel}
                </section>
            </div>

            {floating && <div className={styles.floatingSlot}>{floating}</div>}
        </div>
    );
};

export default ResponsiveShell;

