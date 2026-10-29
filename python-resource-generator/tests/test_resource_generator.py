import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from resource_generator import clean_lines, detect_questions, detect_topics, fetch_official_url, topic_prompts


class ResourceGeneratorTests(unittest.TestCase):
    def test_clean_lines_removes_empty_and_page_markers(self):
        self.assertEqual(
            clean_lines("  Hello   world \n\n[Page 2]\n  A useful line  "),
            ["Hello world", "A useful line"],
        )

    def test_detect_questions_extracts_numbered_questions(self):
        lines = [
            "Q1. Explain the concept of business communication in detail.",
            "2) Describe the role of management in organizations.",
            "This paragraph explains management.",
        ]
        found = detect_questions(lines)
        self.assertEqual(len(found), 2)
        self.assertIn("Q1. Explain the concept of business communication in detail.", found)

    def test_topic_prompts_are_learning_tasks(self):
        prompts = topic_prompts([("Unit 1 Introduction", "A short source paragraph.")])
        self.assertTrue(prompts)
        self.assertIn("your own examples", prompts[0])

    def test_rejects_non_official_url_before_network(self):
        with self.assertRaises(ValueError):
            fetch_official_url("https://example.com/book.pdf")

    def test_detect_topics_handles_heading_and_paragraph(self):
        topics = detect_topics([
            "UNIT 1 INTRODUCTION",
            "This unit introduces the main ideas and course context.",
            "LEARNING OBJECTIVES",
            "Students will identify key terms and examples.",
        ])
        self.assertGreaterEqual(len(topics), 1)
        self.assertEqual(topics[0][0], "UNIT 1 INTRODUCTION")


if __name__ == "__main__":
    unittest.main()
