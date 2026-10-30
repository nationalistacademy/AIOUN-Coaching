import unittest

from aiou_ai import audit_assignment, build_practice_set, word_count


class AssignmentAuditTests(unittest.TestCase):
    def test_counts_words_and_flags_missing_sections(self):
        result = audit_assignment("A short draft without sections.")
        self.assertEqual(result["word_count"], 6)
        self.assertFalse(next(x for x in result["checks"] if x["id"] == "has_headings")["ok"])
        self.assertFalse(next(x for x in result["checks"] if x["id"] == "references")["ok"])

    def test_accepts_clear_sections_and_references(self):
        draft = "# Introduction\n\nFirst paragraph.\n\n## References\n\nVerified book."
        result = audit_assignment(draft)
        self.assertTrue(next(x for x in result["checks"] if x["id"] == "has_headings")["ok"])
        self.assertTrue(next(x for x in result["checks"] if x["id"] == "references")["ok"])

    def test_detects_placeholders(self):
        result = audit_assignment("## Method\n\n[ADD VERIFIED DATA]")
        self.assertFalse(next(x for x in result["checks"] if x["id"] == "placeholder")["ok"])


class PracticeSetTests(unittest.TestCase):
    def test_generates_bounded_revision_questions_from_source(self):
        result = build_practice_set("Unit 1: Introduction\nUnit 2: Research methods", 40)
        self.assertEqual(len(result["questions"]), 30)
        self.assertIn("Unit 1: Introduction", result["questions"][0]["question"])
        self.assertIn("not actual", result["notice"])

    def test_empty_source_still_generates_generic_revision_prompt(self):
        result = build_practice_set("", 2)
        self.assertEqual(len(result["questions"]), 2)
        self.assertIn("supplied course topic", result["questions"][0]["question"])


if __name__ == "__main__":
    unittest.main()
