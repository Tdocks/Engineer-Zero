import unittest

from triage import classify_reading, validate_reading


def reading(**changes):
    value = {"equipment": "pump-7", "temperature": 72.0, "vibration": 2.0, "note": "Synthetic training sample."}
    value.update(changes)
    return value


class TriageTests(unittest.TestCase):
    def test_temperature_at_urgent_boundary_is_urgent(self):
        self.assertEqual(classify_reading(reading(temperature=90.0)), "URGENT")

    def test_review_threshold_is_not_urgent(self):
        self.assertEqual(classify_reading(reading(temperature=80.0)), "REVIEW")

    def test_high_vibration_is_urgent(self):
        self.assertEqual(classify_reading(reading(vibration=8.0)), "URGENT")

    def test_equipment_name_is_required(self):
        with self.assertRaisesRegex(ValueError, "Equipment name"):
            validate_reading(reading(equipment="  "))
