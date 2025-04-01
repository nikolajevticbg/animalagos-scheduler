/**
 * Schedule configuration for April 2025
 * 
 * Each entry represents a reservation to be made
 * - day: Day of month (1-30 for April)
 * - location: The location/street name
 * - timeSlot: Time slot in format HH:MM HH:MM
 */
export interface ScheduleEntry {
  day: string;
  location: string;
  timeSlot: string;
}

/**
 * Mapping of Serbian day names to English day names
 */
export const dayMapping: Record<string, number> = {
  'Ponedeljak': 1,  // Monday
  'Utorak': 2,      // Tuesday
  'Sreda': 3,       // Wednesday
  'Cetvrtak': 4,    // Thursday
  'Petak': 5,       // Friday
  'Subota': 6,      // Saturday
  'Nedelja': 0,     // Sunday
};

/**
 * The full schedule for April 2025 and March 31
 */
export const aprilSchedule: ScheduleEntry[] = [
/*
  // Monday (Ponedeljak) - March 31
  { day: "01-04-2025", location: "Praça Gil Eanes", timeSlot: "17:30 18:00" },
  { day: "01-04-2025", location: "Praça do Infante", timeSlot: "13:30 14:30" },
  { day: "01-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:00 17:30" },
  { day: "01-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:30 18:00" },
  { day: "01-04-2025", location: "Avenida dos Pescadores, Luz – Zona 2", timeSlot: "18:00 18:30" },
  { day: "01-04-2025", location: "Avenida dos Pescadores, Luz – Zona 2", timeSlot: "18:30 19:00" },
  
  // Tuesday (Utorak) - April 2
  { day: "02-04-2025", location: "Praça Gil Eanes", timeSlot: "12:30 13:30" },
  { day: "02-04-2025", location: "Praça do Infante", timeSlot: "13:30 14:30" },
  { day: "02-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:00 17:30" },
  { day: "02-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:30 18:00" },
  { day: "02-04-2025", location: "Avenida dos Pescadores, Luz – Zona 2", timeSlot: "18:00 18:30" },
  { day: "02-04-2025", location: "Avenida dos Pescadores, Luz – Zona 2", timeSlot: "18:30 19:00" },
  
  // Wednesday (Sreda) - April 3
  { day: "03-04-2025", location: "Praça Gil Eanes", timeSlot: "14:00 14:30" },
  { day: "03-04-2025", location: "Praça Gil Eanes", timeSlot: "14:30 15:00" },
  { day: "03-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:00 17:30" },
  { day: "03-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:30 18:00" },
  { day: "03-04-2025", location: "Avenida dos Pescadores, Luz – Zona 2", timeSlot: "18:00 18:30" },
  { day: "03-04-2025", location: "Avenida dos Pescadores, Luz – Zona 2", timeSlot: "18:30 19:00" },
 
  // Thursday (Cetvrtak) - April 4
  { day: "04-04-2025", location: "Praça Gil Eanes", timeSlot: "12:30 13:30" },
  { day: "04-04-2025", location: "Praça do Infante", timeSlot: "13:30 14:30" },
  
  // Friday (Petak) - April 5
  { day: "05-04-2025", location: "Praça Gil Eanes", timeSlot: "12:00 12:30" },
  { day: "05-04-2025", location: "Praça Gil Eanes", timeSlot: "12:30 13:00" },
  { day: "05-04-2025", location: "Praça do Infante", timeSlot: "13:00 13:30" },
  { day: "05-04-2025", location: "Praça do Infante", timeSlot: "13:30 14:00" },
  { day: "05-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "14:00 14:30" },
  { day: "05-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "14:30 15:00" },
  
  // Saturday (Subota) - April 6
  { day: "06-04-2025", location: "Praça Gil Eanes", timeSlot: "12:30 13:30" },
  { day: "06-04-2025", location: "Praça do Infante", timeSlot: "13:30 14:30" },
  { day: "06-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:00 17:30" },
  { day: "06-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:30 18:00" },
  { day: "06-04-2025", location: "Avenida dos Pescadores, Luz – Zona 2", timeSlot: "18:00 18:30" },
  { day: "06-04-2025", location: "Avenida dos Pescadores, Luz – Zona 2", timeSlot: "18:30 19:00" },
  
  // Sunday (Nedelja) - April 7
  { day: "07-04-2025", location: "Praça Gil Eanes", timeSlot: "17:00 17:30" },
  { day: "07-04-2025", location: "Praça Gil Eanes", timeSlot: "17:30 18:00" },
  { day: "07-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:00 18:30" },
  { day: "07-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:30 19:00" },
  
  // Monday (Ponedeljak) - April 8
  { day: "08-04-2025", location: "Praça Gil Eanes", timeSlot: "12:30 13:30" },
  { day: "08-04-2025", location: "Praça do Infante", timeSlot: "13:30 14:30" },
  { day: "08-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:00 17:30" },
  { day: "08-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:30 18:00" },
  { day: "08-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:00 18:30" },
  { day: "08-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:30 19:00" },
  
  
  // Tuesday (Utorak) - April 9
  { day: "09-04-2025", location: "Praça Gil Eanes", timeSlot: "12:30 13:30" },
  { day: "09-04-2025", location: "Praça do Infante", timeSlot: "13:30 14:30" },
  { day: "09-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:00 17:30" },
  { day: "09-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:30 18:00" },
  { day: "09-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:00 18:30" },
  { day: "09-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:30 19:00" },
  
  // Wednesday (Sreda) - April 10
  { day: "10-04-2025", location: "Praça Gil Eanes", timeSlot: "14:00 14:30" },
  { day: "10-04-2025", location: "Praça Gil Eanes", timeSlot: "14:30 15:00" },
  { day: "10-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:00 17:30" },
  { day: "10-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:30 18:00" },
  { day: "10-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:00 18:30" },
  { day: "10-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:30 19:00" },
  
  // Thursday (Cetvrtak) - April 11
  { day: "11-04-2025", location: "Praça Gil Eanes", timeSlot: "12:30 13:30" },
  { day: "11-04-2025", location: "Praça do Infante", timeSlot: "13:30 14:30" },
  
  // Friday (Petak) - April 12
  { day: "12-04-2025", location: "Praça Gil Eanes", timeSlot: "12:00 12:30" },
  { day: "12-04-2025", location: "Praça Gil Eanes", timeSlot: "12:30 13:00" },
  { day: "12-04-2025", location: "Praça do Infante", timeSlot: "13:00 13:30" },
  { day: "12-04-2025", location: "Praça do Infante", timeSlot: "13:30 14:00" },
  { day: "12-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "14:00 14:30" },
  { day: "12-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "14:30 15:00" },
  
  // Saturday (Subota) - April 13*/
  { day: "13-04-2025", location: "Praça Gil Eanes", timeSlot: "12:30 13:00" },
  { day: "13-04-2025", location: "Praça Gil Eanes", timeSlot: "13:00 13:30" },
  { day: "13-04-2025", location: "Praça do Infante", timeSlot: "13:30 14:00" },
  { day: "13-04-2025", location: "Praça do Infante", timeSlot: "14:00 14:30" },/*
  { day: "13-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:00 17:30" },
  { day: "13-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:30 18:00" },
  { day: "13-04-2025", location: "Avenida dos Pescadores, Luz – Zona 2", timeSlot: "18:00 19:00" },
  { day: "13-04-2025", location: "Avenida dos Pescadores, Luz – Zona", timeSlot: "19:00 20:00" },
  
  // Sunday (Nedelja) - April 14
  { day: "14-04-2025", location: "Praça Gil Eanes", timeSlot: "17:00 17:30" },
  { day: "14-04-2025", location: "Praça Gil Eanes", timeSlot: "17:30 18:00" },
  { day: "14-04-2025", location: "Avenida dos Pescadores, Luz – Zona 2", timeSlot: "18:00 19:00" },
  
  // Monday (Ponedeljak) - April 15
  { day: "15-04-2025", location: "Praça Gil Eanes", timeSlot: "12:30 13:00" },
  { day: "15-04-2025", location: "Praça Gil Eanes", timeSlot: "13:00 13:30" },
  { day: "15-04-2025", location: "Praça do Infante", timeSlot: "13:30 14:00" },
  { day: "15-04-2025", location: "Praça do Infante", timeSlot: "14:00 14:30" },
  { day: "15-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:00 17:30" },
  { day: "15-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:30 18:00" },
  { day: "15-04-2025", location: "Avenida dos Pescadores, Luz – Zona 2", timeSlot: "18:00 19:00" },
  { day: "15-04-2025", location: "Avenida dos Pescadores, Luz – Zona", timeSlot: "19:00 20:00" },
  
  // Tuesday (Utorak) - April 16
  { day: "16-04-2025", location: "Praça Gil Eanes", timeSlot: "12:30 13:00" },
  { day: "16-04-2025", location: "Praça Gil Eanes", timeSlot: "13:00 13:30" },
  { day: "16-04-2025", location: "Praça do Infante", timeSlot: "13:30 14:00" },
  { day: "16-04-2025", location: "Praça do Infante", timeSlot: "14:00 14:30" },
  { day: "16-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:00 17:30" },
  { day: "16-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:30 18:00" },
  { day: "16-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:00 18:30" },
  { day: "16-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:30 19:00" },
  
  // Wednesday (Sreda) - April 17
  { day: "17-04-2025", location: "Praça Gil Eanes", timeSlot: "14:00 14:30" },
  { day: "17-04-2025", location: "Praça Gil Eanes", timeSlot: "14:30 15:00" },
  { day: "17-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:00 17:30" },
  { day: "17-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:30 18:00" },
  { day: "17-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:00 18:30" },
  { day: "17-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:30 19:00" },
  
  // Thursday (Cetvrtak) - April 18
  { day: "18-04-2025", location: "Praça Gil Eanes", timeSlot: "12:30 13:00" },
  { day: "18-04-2025", location: "Praça Gil Eanes", timeSlot: "13:00 13:30" },
  { day: "18-04-2025", location: "Praça do Infante", timeSlot: "13:30 14:00" },
  { day: "18-04-2025", location: "Praça do Infante", timeSlot: "14:00 14:30" },
  
  // Friday (Petak) - April 19
  { day: "19-04-2025", location: "Praça Gil Eanes", timeSlot: "12:00 12:30" },
  { day: "19-04-2025", location: "Praça Gil Eanes", timeSlot: "12:30 13:00" },
  { day: "19-04-2025", location: "Praça do Infante", timeSlot: "13:00 13:30" },
  { day: "19-04-2025", location: "Praça do Infante", timeSlot: "13:30 14:00" },
  { day: "19-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "14:00 14:30" },
  { day: "19-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "14:30 15:00" },
  
  // Saturday (Subota) - April 20
  { day: "20-04-2025", location: "Praça Gil Eanes", timeSlot: "12:30 13:00" },
  { day: "20-04-2025", location: "Praça Gil Eanes", timeSlot: "13:00 13:30" },
  { day: "20-04-2025", location: "Praça do Infante", timeSlot: "13:30 14:00" },
  { day: "20-04-2025", location: "Praça do Infante", timeSlot: "14:00 14:30" },
  { day: "20-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:00 17:30" },
  { day: "20-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:30 18:00" },
  { day: "20-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:00 18:30" },
  { day: "20-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:30 19:00" },
  
  // Sunday (Nedelja) - April 21
  { day: "21-04-2025", location: "Praça Gil Eanes", timeSlot: "17:00 17:30" },
  { day: "21-04-2025", location: "Praça Gil Eanes", timeSlot: "17:30 18:00" },
  { day: "21-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:00 18:30" },
  { day: "21-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:30 19:00" },
  
  // Monday (Ponedeljak) - April 22
  { day: "22-04-2025", location: "Praça Gil Eanes", timeSlot: "12:30 13:30" },
  { day: "22-04-2025", location: "Praça do Infante", timeSlot: "13:30 14:30" },
  { day: "22-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:00 17:30" },
  { day: "22-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:30 18:00" },
  { day: "22-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:00 18:30" },
  { day: "22-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:30 19:00" },
  
  // Tuesday (Utorak) - April 23
  { day: "23-04-2025", location: "Praça Gil Eanes", timeSlot: "12:30 13:30" },
  { day: "23-04-2025", location: "Praça do Infante", timeSlot: "13:30 14:30" },
  { day: "23-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:00 17:30" },
  { day: "23-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:30 18:00" },
  { day: "23-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:00 18:30" },
  { day: "23-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:30 19:00" },
  
  // Wednesday (Sreda) - April 24
  { day: "24-04-2025", location: "Praça Gil Eanes", timeSlot: "14:00 14:30" },
  { day: "24-04-2025", location: "Praça Gil Eanes", timeSlot: "14:30 15:00" },
  { day: "24-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:00 17:30" },
  { day: "24-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:30 18:00" },
  { day: "24-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:00 18:30" },
  { day: "24-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:30 19:00" },
  
  // Thursday (Cetvrtak) - April 25
  { day: "25-04-2025", location: "Praça Gil Eanes", timeSlot: "12:30 13:00" },
  { day: "25-04-2025", location: "Praça Gil Eanes", timeSlot: "13:00 13:30" },
  { day: "25-04-2025", location: "Praça do Infante", timeSlot: "13:30 14:00" },
  { day: "25-04-2025", location: "Praça do Infante", timeSlot: "14:00 14:30" },
  
  // Friday (Petak) - April 26
  { day: "26-04-2025", location: "Praça Gil Eanes", timeSlot: "12:00 12:30" },
  { day: "26-04-2025", location: "Praça Gil Eanes", timeSlot: "12:30 13:00" },
  { day: "26-04-2025", location: "Praça do Infante", timeSlot: "13:00 13:30" },
  { day: "26-04-2025", location: "Praça do Infante", timeSlot: "13:30 14:00" },
  { day: "26-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "14:00 14:30" },
  { day: "26-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "14:30 15:00" },
  
  // Saturday (Subota) - April 27
  { day: "27-04-2025", location: "Praça Gil Eanes", timeSlot: "12:30 13:00" },
  { day: "27-04-2025", location: "Praça Gil Eanes", timeSlot: "13:00 13:30" },
  { day: "27-04-2025", location: "Praça do Infante", timeSlot: "13:30 14:00" },
  { day: "27-04-2025", location: "Praça do Infante", timeSlot: "14:00 14:30" },
  { day: "27-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:00 17:30" },
  { day: "27-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:30 18:00" },
  { day: "27-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:00 18:30" },
  { day: "27-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:30 19:00" },
  
  // Sunday (Nedelja) - April 28
  { day: "28-04-2025", location: "Praça Gil Eanes", timeSlot: "17:00 17:30" },
  { day: "28-04-2025", location: "Praça Gil Eanes", timeSlot: "17:30 18:00" },
  { day: "28-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:00 18:30" },
  { day: "28-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:30 19:00" },
  
  // Monday (Ponedeljak) - April 29
  { day: "29-04-2025", location: "Praça Gil Eanes", timeSlot: "12:30 13:00" },
  { day: "29-04-2025", location: "Praça Gil Eanes", timeSlot: "13:00 13:30" },
  { day: "29-04-2025", location: "Praça do Infante", timeSlot: "13:30 14:00" },
  { day: "29-04-2025", location: "Praça do Infante", timeSlot: "14:00 14:30" },
  { day: "29-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:00 17:30" },
  { day: "29-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:30 18:00" },
  { day: "29-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:00 18:30" },
  { day: "29-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:30 19:00" },
  
  // Tuesday (Utorak) - April 30
  { day: "30-04-2025", location: "Praça Gil Eanes", timeSlot: "12:30 13:00" },
  { day: "30-04-2025", location: "Praça Gil Eanes", timeSlot: "13:00 13:30" },
  { day: "30-04-2025", location: "Praça do Infante", timeSlot: "13:30 14:00" },
  { day: "30-04-2025", location: "Praça do Infante", timeSlot: "14:00 14:30" },
  { day: "30-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:00 17:30" },
  { day: "30-04-2025", location: "Gaveto da rua da Praia e rua José da Conceição Conde, Luz", timeSlot: "17:30 18:00" },
  { day: "30-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:00 18:30" },
  { day: "30-04-2025", location: "Avenida dos Pescadores, Luz - Zona 2", timeSlot: "18:30 19:00" },*/
];

/**
 * Generate schedule for the whole month based on weekly pattern
 */
export function generateMonthlySchedule(): ScheduleEntry[] {
  return aprilSchedule;
} 