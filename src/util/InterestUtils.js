export function getInterestsForJobType(jobType) {
  const normalizedJobType = jobType.toLowerCase();
  /*
    title: "Babysitting",
    title: "Dog Walking/Pet Sitting",
    title: "Academic Tutoring",
    title: "Private Lessons",
    title: "Yard Work",
    title: "Housework",
    title: "Car Cleaning",
    title: "Power Washing",
    title: "Other",
  */
  const jobTypeToInterestsMap = {
    babysitting: ["babysitting"],
    "dog walking/pet sitting": ["pets"],
    "academic tutoring": ["tutoring"],
    "private lessons": ["private_lessons"],
    "yard work": ["yardwork_housework"],
    housework: ["yardwork_housework"],
    "car cleaning": ["car_cleaning"],
    "power washing": ["power_washing"],
    other: [],
  };

  return jobTypeToInterestsMap[normalizedJobType] || [];
}
