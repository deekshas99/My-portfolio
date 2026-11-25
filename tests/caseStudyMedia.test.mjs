import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { CASE_STUDY_PREVIEWS } from '../src/caseStudyImagePreviews.mjs';
import { desktopSlideWindow, getCaseStudyImageProps } from '../src/caseStudyMedia.mjs';

test('desktop window contains only nearby and transitioning chapters', () => {
  assert.deepEqual(desktopSlideWindow(19,0,0),[0,1,2]);
  assert.deepEqual(desktopSlideWindow(19,10,9,9),[7,8,9,10,11]);
  assert.deepEqual(desktopSlideWindow(19,15,9,9),[7,8,9,10,11,15]);
  assert.deepEqual(desktopSlideWindow(19,18,18),[16,17,18]);
});
test('panel previews are bounded and preserve original files', () => {
  const source='/case-studies/podcaster/HofYMUvF3YLR75FyVc5HS4YGoNU.png';
  const props=getCaseStudyImageProps(source);
  assert.notEqual(props.src,source);
  assert.match(props.srcSet,/1280w/);
  assert.match(props.srcSet,/2400w/);
  assert.equal(getCaseStudyImageProps('/aurora-cover.jpg').src,'/aurora-cover.jpg');
  for(const [original,candidates] of Object.entries(CASE_STUDY_PREVIEWS)){
    assert.ok(existsSync(fileURLToPath(new URL('../public'+original,import.meta.url))));
    for(const image of candidates){
      assert.ok(Math.max(image.width,image.height)<=2400);
      assert.ok(existsSync(fileURLToPath(new URL('../public'+image.src,import.meta.url))));
    }
  }
});
