export function statusColor(status: number): string {
	if (status >= 200 && status < 300) return 'green';
	if (status >= 300 && status < 400) return 'yellow';
	if (status >= 400 && status < 500) return 'red';
	if (status >= 500) return 'magenta';
	return 'gray';
}
